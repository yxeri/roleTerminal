import store from '../redux/store';
import { isOnline, isReconnecting } from '../redux/selectors/online';
import {
  offline,
  online,
  startup,
} from '../redux/actions/online';
import {
  getDeviceId,
  setDeviceId,
  getToken as getStoredToken,
  getUserId as getStoredUserId,
  getAliasId as getStoredAliasId,
} from '../StorageManager';
import {
  logout as logoutAction,
  login as loginAction,
} from '../redux/actions/auth';
import { getUserId } from '../redux/selectors/userId';
import { chatMessage, whisperMessage } from './listeners/messages';
import { follow, room } from './listeners/rooms';
import { user } from './listeners/users';
import { changeAliasId } from '../redux/actions/aliasId';
import { alias } from './listeners/aliases';
import { wallet } from './listeners/wallets';
import { transaction } from './listeners/transactions';
import { docFile } from './listeners/docFiles';
import { batch } from 'react-redux';
import {
  ALIASES, DEVICES,
  DOCFILES, FORUMPOSTS,
  FORUMS,
  FORUMTHREADS, GAMECODES,
  INVITATIONS,
  MESSAGES,
  ROOMS, SIMPLEMSGS,
  TEAMS, TRANSACTIONS,
  USERS, WALLETS
} from '../redux/actionTypes';
import { ChangeTypes } from '../redux/reducers/root';

const socket = (() => {
  let socketUri = typeof ioUri !== 'undefined' // eslint-disable-line no-undef
    ? ioUri // eslint-disable-line no-undef
    : '/';

  if (process.env.NODE_ENV === 'development') {
    socketUri = `${window.location.hostname}:8888`;
  }

  return window.io(socketUri, { forceNew: true });
})();

export const SendEvents = {
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
  FOLLOW: 'followRoom',
  GETMSGBYROOM: 'getMessagesByRoom',
  REMOVEROOM: 'removeRoom',
  UNLOCKDOCFILE: 'unlockDocFile',
  UPDATEUSER: 'updateUser',
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

export const ActionEvents = {
  LOGIN: 'login',
};

export const ListenerEvents = {
  RECONNECT: 'reconnect',
  STARTUP: 'startup',
  DISCONNECT: 'disconnect',
  MSGCHAT: 'chatMsg',
  MSGWHISPER: 'whisper',
};

// export const EmitTypes = {
//   FORUM: 'forum',
//   FORUMTHREAD: 'forumThread',
//   FORUMPOST: 'forumPost',

//   DEVICE: 'device',
//   DOCFILE: 'docFile',

//   BROADCAST: 'broadcast',
//   GAMECODE: 'gameCode',
//   ALIAS: 'alias',
//   CREATEPOSITION: 'createPosition',
//   POSITION: 'position',

//   TEAM: 'team',
//   INVITATION: 'invitation',
//   TEAMMEMBER: 'team member',
//   LOGOUT: 'logout',
//   BAN: 'ban',
//   WALLET: 'wallet',
//   TRANSACTION: 'transaction',
//   TEAMSCORING: 'teamScoring',
//   TERMINATE: 'terminate',
//   SENDMSG: 'sendMessage',
//   UPDATEPOSITION: 'updatePosition',
//   UPDATEPOSITIONCOORDINATES: 'updatePositionCoordinates',
//   ,
//   BANUSER: 'banUser',
//   UNBANUSER: 'unbanUser',
//   VERIFYUSER: 'verifyUser',
//   CHANGEPASSWORD: 'changePassword',
//
//   UPDATEWALLET: 'updateWallet',
//   UNFOLLOW: 'unfollowRoom',
//   CREATETRANSACTION: 'createTransaction',
//   INVITETEAM: 'inviteToTeam',
//   LEAVETEAM: 'leaveTeam',
//   SIMPLEMSG: 'simpleMsg',
//   INVITEROOM: 'inviteToRoom',
//   DECLINEINVITE: 'decline',
//   ACCEPTTEAM: 'acceptTeamInvitation',
//   ACCEPTROOM: 'acceptRoomInvitation',
//   SENDROOMINVITE: 'sendInvitationToRoom',
//   GETUSERBYCODE: 'getUserByCode',
//   USEGAMECODE: 'useGameCode',
//   CONNECTUSER: 'connectUser',
// };

export const addSocketListener = async ({ event, callback }) => {
  socket.on(event, (params) => { console.log(event, params); callback(params); });
};

export const reconnect = () => {
  if (!isReconnecting(store.getState())) {
    socket.disconnect();
    socket.connect();
  }
};

/**
 * Emit event through socket.io.
 * @param {string} event Event to emit.
 * @param {Object} [params] Parameters to send in the emit.
 */
export const emitSocketEvent = async (event, params = {}) => new Promise((resolve, reject) => {
  const paramsToSend = params;
  paramsToSend.token = getStoredToken();

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

export const retrieveAll = async ({ reset } = {}) => {
  [
    { type: USERS, event: GetEvents.USERS },
    { type: ALIASES, event: GetEvents.ALIASES },
    { type: TEAMS, event: GetEvents.TEAMS },
    { type: ROOMS, event: GetEvents.ROOMS },
    { type: MESSAGES, event: GetEvents.MESSAGES },
    { type: INVITATIONS, event: GetEvents.INVITATIONS },
    { type: DOCFILES, event: GetEvents.DOCFILES },
    { type: FORUMS, event: GetEvents.FORUMS },
    { type: FORUMTHREADS, event: GetEvents.FORUMTHREADS },
    { type: FORUMPOSTS, event: GetEvents.FORUMPOSTS },
    { type: GAMECODES, event: GetEvents.GAMECODES },
    { type: SIMPLEMSGS, event: GetEvents.SIMPLEMSGS },
    { type: WALLETS, event: GetEvents.WALLETS },
    { type: TRANSACTIONS, event: GetEvents.TRANSACTIONS },
    { type: DEVICES, event: GetEvents.DEVICES },
  ].forEach((getter) => {
    const { event, type } = getter;

    emitSocketEvent(event, {})
      .then((result) => {
        console.log(event, result);

        store.dispatch({
          type,
          payload: {
            reset,
            changeType: ChangeTypes.CREATE,
            [type]: result[type],
          },
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

addSocketListener({
  event: ListenerEvents.RECONNECT,
  callback: () => {
    if (getUserId(store.getState())) {
      emitSocketEvent('updateId', {})
        .then(() => {
          store.dispatch(online());
          retrieveAll();
        })
        .catch((error) => {
          console.log(error);
          store.dispatch(logoutAction(retrieveAll));
        });
    } else {
      retrieveAll();
    }
  },
});

addSocketListener({
  event: ListenerEvents.STARTUP,
  callback: ({ data }) => {
    const userId = getStoredUserId();
    const token = getStoredToken();
    const aliasId = getStoredAliasId();

    if (!getDeviceId()) {
      setDeviceId('1234567890123456');
    }

    store.dispatch(startup(data));

    if (userId || token) {
      emitSocketEvent('updateId', {})
        .then(() => {
          batch(() => {
            if (aliasId) {
              store.dispatch(changeAliasId({ aliasId }));
            }

            store.dispatch(loginAction({
              userId,
              token,
              retrieveAll,
            }));
          });
        })
        .catch((error) => {
          console.log(error);
          store.dispatch(logoutAction(retrieveAll));
        });
    } else {
      retrieveAll({ reset: true });
    }
  },
});

addSocketListener({
  event: ListenerEvents.DISCONNECT,
  callback: () => {
    store.dispatch(offline());

    reconnect();
  },
});

// Messages
addSocketListener(chatMessage());
addSocketListener(whisperMessage());

// Rooms
addSocketListener(room());
addSocketListener(follow());

// User
addSocketListener(user());

// Aliases
addSocketListener(alias());

// Wallets
addSocketListener(wallet());

// Transactions
addSocketListener(transaction());

// DocFiles
addSocketListener(docFile());
