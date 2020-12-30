import createCachedSelector from 're-reselect';
import { MessageType } from '../reducers/messages';

export const getMessageById = (state, { id }) => state.messages.get(id);

export const getAllMessages = (state) => state.messages;

export const getMessagesByRoom = createCachedSelector(
  [
    getAllMessages,
    (_, { roomId }) => roomId,
  ],
  (messages, roomId) => [...messages.values()].filter((message) => message.roomId === roomId),
)((_, { roomId }) => roomId);

export const getNews = createCachedSelector(
  [getAllMessages],
  (messages) => [...messages.values()]
    .filter((message) => message.messageType === MessageType.NEWS)
    .reverse(),
)(() => 'news');

export const getNewsIdsPoints = createCachedSelector(
  [getNews],
  (messages) => messages
    .map(({ objectId, points }) => ({ objectId, points }))
    .reverse(),
)(() => 'news-ids');

export const getMessageIdsByRoom = createCachedSelector(
  [getMessagesByRoom],
  (messages) => messages.map(({ objectId }) => objectId),
)((_, { roomId }) => `id-${roomId}`);
