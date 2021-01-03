import createCachedSelector from 're-reselect';
import { createSelectorCreator, defaultMemoize } from 'reselect';

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

export const getMessageIdsByRoom = createCachedSelector(
  [getMessagesByRoom],
  (messages) => messages.map(({ objectId }) => objectId),
)((_, { roomId }) => `id-${roomId}`);

export const getNewsIdsPoints = createCachedSelector(
  [getNews],
  (messages) => messages
    .map(({ objectId, points }) => ({ objectId, points })),
)({
  keySelector: () => 'news-ids',
  selectorCreator: createSelectorCreator(
    defaultMemoize,
    (a, b) => a.length === b.length && b.every((message, index) => {
      const otherMessage = a[index];

      return otherMessage && otherMessage.objectId === message.objectId;
    }),
  ),
});
