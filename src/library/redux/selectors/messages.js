import createCachedSelector from 're-reselect';

export const getMessageById = (state, { id }) => state.messages.get(id);

export const getAllMessages = (state) => state.messages;

export const getMessagesByRoom = createCachedSelector(
  [
    getAllMessages,
    (_, { roomId }) => roomId,
  ],
  (messages, roomId) => [...messages.values()].filter((message) => message.roomId === roomId),
)((_, { roomId }) => roomId);

export const getMessageIdsByRoom = createCachedSelector(
  [getMessagesByRoom],
  (messages) => messages.map(({ objectId }) => objectId),
)((_, { roomId }) => `id-${roomId}`);
