import store from './redux/store';
import { changeWindowOrder } from './redux/actions/windowOrder';
import { updateUser } from './socket/actions/users';
import { getCurrentUser } from './redux/selectors/users';

export const MessageTypes = {
  NOTIFICATION: 'notification',
  WINDOW: 'window',
  PUSHTOKEN: 'pushToken',
  MESSAGE: 'message',
  LOGIN: 'login',
  LOGOUT: 'logout',
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

  if (!currentUser.isAnonymous) {
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

const onMessageListener = (event) => {
  alert(JSON.stringify(event.data));

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
      default: {
        console.log('Unknown message', event.nativeEvent.data);

        break;
      }
    }
  }
};

window.addEventListener('message', onMessageListener);

document.addEventListener('message', onMessageListener);
