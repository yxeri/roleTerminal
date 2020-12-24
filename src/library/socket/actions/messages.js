import { SendEvents, emitSocketEvent } from '../SocketManager';
import { getRoom } from '../../redux/selectors/rooms';
import store from '../../redux/store';
import { getCurrentIdentityId } from '../../redux/selectors/userId';
import { createMessages } from '../../redux/actions/messages';
import { getAliasId } from '../../redux/selectors/aliasId';

const MessageType = {
  CHAT: 'chat',
  WHISPER: 'whisper',
  BROADCAST: 'broadcast',
  MESSAGE: 'message',
};

export const sendMessage = async ({ text, roomId, image }) => {
  const room = getRoom(store.getState(), { id: roomId });
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

export const getMessagesByRoom = async ({ roomId }) => {
  const result = await emitSocketEvent(SendEvents.GETMSGBYROOM, { roomId });

  store.dispatch(createMessages({ messages: result.messages }));

  return true;
};
