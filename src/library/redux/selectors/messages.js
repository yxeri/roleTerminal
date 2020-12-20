import createCachedSelector from 're-reselect';

export const getMessagesByRoom = createCachedSelector(
  [
    (state) => state.messages,
    (_, { roomId }) => roomId,
  ],
  (messages, roomId) => [...messages.values()].filter((message) => message.roomId === roomId),
)((_, { roomId }) => roomId);
