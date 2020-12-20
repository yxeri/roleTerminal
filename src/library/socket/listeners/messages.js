import store from '../../redux/store';
import { createMessages } from '../../redux/actions/messages';
import { ChangeTypes } from '../../redux/reducers/root';

const events = {
  MSGCHAT: 'chatMsg',
  MSGWHISPER: 'whisper',
};

export const chatMessage = () => ({
  event: events.MSGCHAT,
  callback: ({ data, error }) => {
    if (data && data.message) {
      const { message, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createMessages({ messages: [message] }));
      }

      return;
    }

    console.log(events.MSGCHAT, error, data);
  },
});

export const whisperMessage = () => ({
  event: events.MSGWHISPER,
  callback: ({ data, error }) => {
    if (data && data.message) {
      const { message, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createMessages({ messages: [message] }));
      }

      return;
    }

    console.log(events.MSGWHISPER, error, data);
  },
});
