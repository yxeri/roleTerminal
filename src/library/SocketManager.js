import store from './redux/store';
import { getToken } from './redux/selectors/token';
import { isOnline, isReconnecting } from './redux/selectors/online';
import {
  CONFIG,
  ONLINE,
  TOKEN,
  USERID,
} from './redux/actionTypes';
import { Status } from './redux/reducers/online';

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
 * @param {Function} [callback] Callback.
 */
export function emitSocketEvent(event, params = {}, callback = () => {}) {
  const paramsToSend = params;
  paramsToSend.token = getToken(store.getState());

  if (!isOnline(store.getState())) {
    reconnect();
  }

  socket.emit(event, paramsToSend, callback);
}

export function login(username, password, callback) {
  emitSocketEvent('login', { user: { username, password } }, ({ error, data }) => {
    if (error) {
      callback({ error });

      return;
    }

    const { user, token } = data;

    store.dispatch({
      type: USERID,
      payload: { userId: user.objectId },
    });
    store.dispatch({
      type: TOKEN,
      payload: { token },
    });

    callback({ data });
  });
}

export function logout() {
  store.dispatch({
    type: TOKEN,
    payload: { reset: true },
  });
  store.dispatch({
    type: USERID,
    payload: { reset: true },
  });
}

if (process.env.NODE_ENV === 'development') {
  setInterval(() => { emitSocketEvent('ping'); }, 1000);
}

addSocketListener(EmitTypes.RECONNECT, () => {
  if (!getToken(store.getState())) {
    store.dispatch({
      type: ONLINE,
      payload: { online: Status.ONLINE },
    });

    return;
  }

  emitSocketEvent('updateId', {}, ({ error }) => {
    if (error) {
      // Banana
    }

    store.dispatch({
      type: ONLINE,
      payload: { online: Status.ONLINE },
    });
  });
});

addSocketListener(EmitTypes.STARTUP, ({ data }) => {
  store.dispatch({
    type: CONFIG,
    payload: {
      entries: Object.entries(data),
    },
  });
  store.dispatch({
    type: ONLINE,
    payload: { online: Status.ONLINE },
  });
});

addSocketListener(EmitTypes.DISCONNECT, () => {
  store.dispatch({
    type: ONLINE,
    payload: { online: Status.OFFLINE },
  });

  reconnect();
});
