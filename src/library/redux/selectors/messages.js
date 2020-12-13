import { getBroadcastId, getPublicRoomId } from './config';

export const SortBy = {
  DATE: 'date',
};

export const getMessage = (state, { id }) => state.messages.get(id);

export const getAllMessages = (state) => [...state.messages.values()];

export const getMessages = (state, { roomId = getPublicRoomId(state), sortBy = '' } = {}) => {
  const messages = getAllMessages(state)
    .filter((message) => message.roomId === roomId || message.roomId === getBroadcastId(state));

  switch (sortBy) {
    case SortBy.DATE: {
      return messages.filter((room) => !room.isWhisper && !room.isUser).sort((a, b) => {
        const aParam = a.customTimeCreated || a.timeCreated;
        const bParam = b.customTimeCreated || b.timeCreated;

        return aParam < bParam
          ? -1
          : 1;
      });
    }
    default: {
      return messages;
    }
  }
};
