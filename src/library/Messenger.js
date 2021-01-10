import store from './redux/store';
import { changeWindowOrder } from './redux/actions/windowOrder';
import { updateUser } from './socket/actions/users';
import { getCurrentUser, getCurrentUserRooms } from './redux/selectors/users';
import { getNewsRoomId } from './redux/selectors/config';
import { WindowTypes } from './redux/reducers/windowOrder';

export const MessageTypes = {
  NOTIFICATION: 'notification',
  WINDOW: 'window',
  PUSHTOKEN: 'pushToken',
  MESSAGE: 'message',
  LOGIN: 'login',
  LOGOUT: 'logout',
  QR: 'qr',
  QUIT: 'quit',
};

export const postMessage = ({ type, data }) => {
  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
  }
};

const onNotification = (data) => {
  alert(JSON.stringify(data));
};

const onWindow = ({ windowType, value }) => {
  store.dispatch(changeWindowOrder({ windows: [{ id: windowType, value: { ...value, type: windowType } }] }));
};

const onPushToken = ({ token }) => {
  const currentUser = getCurrentUser(store.getState());

  if (!currentUser.isAnonymous && token !== currentUser.pushToken) {
    updateUser({
      userId: currentUser.objectId,
      user: { pushToken: token },
    })
      .catch((error) => console.log(error));
  }
};

const onMessage = ({ message }) => {
  alert(JSON.stringify(message));
};

const onQr = (data) => {
  try {
    const {
      rI: roomId,
      rP: password,
      mI: messageId,

      wI: toWalletId,
      a: amount,

      m: message,

      dI: docFileId,
      c: code,

      tI: teamId,

      iI: identityId,
    } = data;
    const newsRoomId = getNewsRoomId(store.getState());

    if (roomId && messageId && roomId === newsRoomId) {
      store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.NEWS, value: { type: WindowTypes.NEWS, messageId } }] }));
    } else if (roomId) {
      const roomIds = getCurrentUserRooms(store.getState());

      if (roomIds.includes(roomId)) {
        store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT, roomId, messageId } }] }));
      } else {
        store.dispatch(changeWindowOrder({
          windows: [{
            id: `${WindowTypes.DIALOGJOINROOM}-${roomId}`,
            value: {
              roomId,
              messageId,
              password,
              type: WindowTypes.DIALOGJOINROOM,
            },
          }],
        }));
      }
    } else if (toWalletId) {
      store.dispatch(changeWindowOrder({ windows: [{ id: `${WindowTypes.DIALOGCREATETRANSACTION}-${toWalletId}`, value: { type: WindowTypes.DIALOGCREATETRANSACTION, toWalletId, amount } }] }));
    } else if (docFileId) {
      store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DOCFILE, value: { type: WindowTypes.DOCFILE, docFileId, code } }] }));
    } else if (teamId) {
      store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.TEAMS, value: { type: WindowTypes.TEAMS, teamId } }] }));
    } else if (identityId) {
      store.dispatch(changeWindowOrder({ windows: [{ id: `${WindowTypes.DIALOGIDENTITY}-${identityId}`, value: { type: WindowTypes.DIALOGIDENTITY, identityId } }] }));
    } else if (message) {
      alert(message);
    }
  } catch (error) {
    alert(`Invalid data ${data}`);
  }
};

const onMessageListener = (event) => {
  if (event.data) {
    const { type, data } = JSON.parse(event.data);

    switch (type) {
      case MessageTypes.NOTIFICATION: {
        onNotification(data);

        break;
      }
      case MessageTypes.WINDOW: {
        onWindow(data);

        break;
      }
      case MessageTypes.PUSHTOKEN: {
        onPushToken(data);

        break;
      }
      case MessageTypes.MESSAGE: {
        onMessage(data);

        break;
      }
      case MessageTypes.QR: {
        onQr(data);

        break;
      }
      default: {
        console.log('Unknown message', event.nativeEvent.data);

        break;
      }
    }
  }
};

if (window.ReactNativeWebView) {
  window.addEventListener('message', onMessageListener);

  document.addEventListener('message', onMessageListener);
}
