import store from '../../redux/store';
import { createMessages } from '../../redux/actions/messages';
import { ChangeTypes } from '../../redux/reducers/root';
import { getCurrentUser, getIdentityById } from '../../redux/selectors/users';
import { updateUser } from '../actions/users';

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
      const { objectId: userId, hasSeen = [], partOfTeams } = getCurrentUser(store.getState());
      const sender = getIdentityById(store.getState(), { id: message.ownerAliasId || message.ownerId });

      if (!hasSeen.includes(message.ownerAliasId || message.ownerId) && !partOfTeams.some((teamId) => sender.partOfTeams.includes(teamId))) {
        updateUser({
          userId,
          user: {
            hasSeen: hasSeen.concat([message.ownerAliasId || message.ownerId]),
          },
        })
          .catch((updateError) => console.log(updateError));
      }

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createMessages({ messages: [message] }));
      }

      return;
    }

    console.log(events.MSGWHISPER, error, data);
  },
});
