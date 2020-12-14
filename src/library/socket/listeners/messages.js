import store from '../../redux/store';
import { createMessages } from '../../redux/actions/messages';
import { ChangeTypes } from '../../redux/reducers/root';

const events = {
  MSGCHAT: 'chatMsg',
  MSGWHISPER: 'whisper',
};

export const chatMessage = () => ({
  event: events.MSGCHAT,
  callback: ({ data }) => {
    if (data && data.message) {
      const { message, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createMessages({ messages: [message] }));
      }
    }
  },
});

export const chatMessages = () => ({
  event: events.MSGCHAT,
  callback: ({ data }) => {
    if (data && data.messages) {
      const { messages, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createMessages({ messages }));
      }
    }
  },
});
