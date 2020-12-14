import { MESSAGE, MESSAGES } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const createMessages = ({ messages }) => {
  if (messages.length === 1) {
    return {
      type: MESSAGE,
      payload: {
        changeType: ChangeTypes.CREATE,
        message: messages[0],
      },
    };
  }

  return {
    type: MESSAGES,
    payload: {
      messages,
      changeType: ChangeTypes.CREATE,
    },
  };
};
