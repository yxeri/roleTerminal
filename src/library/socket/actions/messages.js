import { SendEvents, emitSocketEvent } from '../SocketManager';
import { getRoomById } from '../../redux/selectors/rooms';
import store from '../../redux/store';
import { getCurrentIdentityId } from '../../redux/selectors/userId';
import { createMessages, createNewsMessage } from '../../redux/actions/messages';
import { getAliasId } from '../../redux/selectors/aliasId';
import { getNewsRoomId } from '../../redux/selectors/config';
import { MessageType } from '../../redux/reducers/messages';

export const sendMessage = async ({ text, roomId, image }) => {
  const room = getRoomById(store.getState(), { id: roomId });
  const participantIds = room.isWhisper
    ? room.participantIds
    : [];
  const message = {
    roomId,
    ownerAliasId: getAliasId(store.getState()) || undefined,
    text: text.split('\n'),
  };

  if (room.isUser) {
    message.messageType = MessageType.WHISPER;
    participantIds.push(getCurrentIdentityId(store.getState()));
    participantIds.push(roomId);
  } else if (room.isWhisper) {
    message.messageType = MessageType.WHISPER;
  } else {
    message.messageType = MessageType.CHAT;
  }

  const result = await emitSocketEvent(SendEvents.MESSAGE, {
    message,
    image,
    participantIds,
  });

  store.dispatch(createMessages({ messages: [result.message] }));

  return { message: result.message, switchRoom: true };
};

export const sendNewsMessage = async ({ title, text, image }) => {
  const message = {
    messageType: MessageType.NEWS,
    text: [title].concat(text.split('\n')),
    roomId: getNewsRoomId(store.getState()),
    ownerAliasId: getAliasId(store.getState()) || undefined,
  };

  const result = await emitSocketEvent(SendEvents.MESSAGE, {
    message,
    image,
  });

  store.dispatch(createNewsMessage(result));

  return { message: result.message };
};

export const getMessagesByRoom = async ({ roomId }) => {
  const result = await emitSocketEvent(SendEvents.GETMSGBYROOM, { roomId });

  store.dispatch(createMessages({ messages: result.messages }));

  return true;
};
