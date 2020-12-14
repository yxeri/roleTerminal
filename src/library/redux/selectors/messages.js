import { createSelector } from 'reselect';

export const getAllMessages = (state) => state.messages;

export const getMessagesByRoom = (roomId) => createSelector(
  [getAllMessages],
  (messages) => [...messages.values()].filter((message) => message.roomId === roomId),
);
