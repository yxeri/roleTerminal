import { MESSAGE, MESSAGES } from '../actionTypes';
import { ChangeTypes } from '../../SocketManager';

export const createMessage = (message) => {
  return {
    type: MESSAGE,
    payload: {
      message,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateMessage = ((message) => {
  return {
    type: MESSAGE,
    payload: {
      message,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeMessage = (message) => {
  return {
    type: MESSAGE,
    payload: {
      message,
      changeType: ChangeTypes.REMOVE,
    },
  };
};

export const createMessages = (messages) => {
  return {
    type: MESSAGES,
    payload: {
      messages,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateMessages = ((messages) => {
  return {
    type: MESSAGES,
    payload: {
      messages,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeMessages = (messages) => {
  return {
    type: MESSAGES,
    payload: {
      messages,
      changeType: ChangeTypes.REMOVE,
    },
  };
};
