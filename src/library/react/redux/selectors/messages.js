import { getRoomId } from './roomId';

const broadcastId = '111111111111111111111116';

export const getMessages = (state, { roomId = getRoomId(state) } = {}) => {
  return getAllMessages(state).filter((message) => message.roomId === roomId || message.roomId === broadcastId);
};

export const getAllMessages = (state) => {
  return [...state.messages.values()];
};
