import store from './redux/store';
import { getToken } from './redux/selectors/token';
import { isOnline, isReconnecting } from './redux/selectors/online';
import {
  login as loginAction,
  logout as logoutAction,
} from './redux/actions/auth';
import {
  online,
  offline,
  startup,
} from './redux/actions/online';

const socket = (() => {
  let socketUri = typeof ioUri !== 'undefined' // eslint-disable-line no-undef
    ? ioUri // eslint-disable-line no-undef
    : '/';

  if (process.env.NODE_ENV === 'development') {
    socketUri = 'http://localhost:8888';
  }

  console.log(socketUri);

  return window.io(socketUri, { forceNew: true });
})();

export const createEvents = {
  ALIAS: 'createAlias',
  USER: 'createUser',
  MESSAGE: 'sendMessage',
  ROOM: 'createRoom',
  INVITATION: 'createInvitation',
  DOCFILE: 'createDocFile',
  FORUM: 'createForum',
  FORUMPOST: 'createForumPost',
  FORUMTHREAD: 'createForumThread',
  GAMECODE: 'createGameCode',
  SIMPLEMSG: 'sendSimpleMsg',
  TEAM: 'createTeam',
  TRANSACTION: 'createTransaction',
  DEVICE: 'createDevice',
};

export const GetEvents = {
  ALIASES: 'getAliases',
  USERS: 'getUsers',
  MESSAGES: 'getMessages',
  ROOMS: 'getRooms',
  INVITATIONS: 'getInvitations',
  DOCFILES: 'getDocFiles',
  FORUMS: 'getForums',
  FORUMPOSTS: 'getForumPosts',
  FORUMTHREADS: 'getForumThreads',
  GAMECODES: 'getGameCodes',
  SIMPLEMSGS: 'getSimpleMsgs',
  TEAMS: 'getTeams',
  TRANSACTIONS: 'getTransactions',
  WALLETS: 'getWallets',
  DEVICES: 'getDevices',
};

export const EmitTypes = {
  FORUM: 'forum',
  FORUMTHREAD: 'forumThread',
  FORUMPOST: 'forumPost',
  FOLLOW: 'followRoom',
  USER: 'user',
  CHATMSG: 'chatMsg',
  DEVICE: 'device',
  DOCFILE: 'docFile',
  WHISPER: 'whisper',
  BROADCAST: 'broadcast',
  GAMECODE: 'gameCode',
  ALIAS: 'alias',
  CREATEPOSITION: 'createPosition',
  POSITION: 'position',
  ROOM: 'room',
  FOLLOWER: 'follower',
  TEAM: 'team',
  INVITATION: 'invitation',
  TEAMMEMBER: 'team member',
  LOGOUT: 'logout',
  BAN: 'ban',
  WALLET: 'wallet',
  TRANSACTION: 'transaction',
  TEAMSCORING: 'teamScoring',
  DISCONNECT: 'disconnect',
  RECONNECT: 'reconnect',
  TERMINATE: 'terminate',
  STARTUP: 'startup',
  SENDMSG: 'sendMessage',
  UPDATEPOSITION: 'updatePosition',
  UPDATEPOSITIONCOORDINATES: 'updatePositionCoordinates',
  UNLOCKDOCFILE: 'unlockDocFile',
  GETROOMMSGS: 'getMessagesByRoom',
  BANUSER: 'banUser',
  UNBANUSER: 'unbanUser',
  VERIFYUSER: 'verifyUser',
  CHANGEPASSWORD: 'changePassword',
  UPDATEUSER: 'updateUser',
  UPDATEWALLET: 'updateWallet',
  UNFOLLOW: 'unfollowRoom',
  CREATETRANSACTION: 'createTransaction',
  INVITETEAM: 'inviteToTeam',
  LEAVETEAM: 'leaveTeam',
  SIMPLEMSG: 'simpleMsg',
  INVITEROOM: 'inviteToRoom',
  DECLINEINVITE: 'decline',
  ACCEPTTEAM: 'acceptTeamInvitation',
  ACCEPTROOM: 'acceptRoomInvitation',
  SENDROOMINVITE: 'sendInvitationToRoom',
  GETUSERBYCODE: 'getUserByCode',
  USEGAMECODE: 'useGameCode',
  CONNECTUSER: 'connectUser',
};

export function addSocketListener(event, callback) {
  socket.on(event, (params) => { console.log(event, params); callback(params); });
}

export function reconnect() {
  if (!isReconnecting(store.getState())) {
    socket.disconnect();
    socket.connect();
  }
}

/**
 * Emit event through socket.io.
 * @param {string} event Event to emit.
 * @param {Object} [params] Parameters to send in the emit.
 */
export async function emitSocketEvent(event, params = {}) {
  return new Promise((resolve, reject) => {
    const paramsToSend = params;
    paramsToSend.token = getToken(store.getState());

    if (!isOnline(store.getState())) {
      reconnect();
    }

    socket.emit(event, paramsToSend, ({ error, data }) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

export async function login(username, password) {
  const result = await emitSocketEvent('login', { user: { username, password } });

  const { user, token } = result;

  store.dispatch(loginAction({ userId: user.objectId, token }));

  return result;
}

export function logout() {
  store.dispatch(logoutAction());
}

if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    emitSocketEvent('ping').catch(() => {
      console.log('ping failed');
    });
  }, 1000);
}

addSocketListener(EmitTypes.RECONNECT, () => {
  if (!getToken(store.getState())) {
    store.dispatch(online());

    return;
  }

  emitSocketEvent('updateId', {})
    .then(() => {
      store.dispatch(online());
    })
    .catch((error) => {
      console.log(error);
    });
});

addSocketListener(EmitTypes.STARTUP, ({ data }) => {
  store.dispatch(startup(data));
});

addSocketListener(EmitTypes.DISCONNECT, () => {
  store.dispatch(offline());

  reconnect();
});
