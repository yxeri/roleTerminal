import { CreateEvents, emitSocketEvent } from '../SocketManager';
import { getRoom } from '../../redux/selectors/rooms';
import store from '../../redux/store';
import { getIdentityId } from '../../redux/selectors/userId';

const MessageType = {
  CHAT: 'chat',
  WHISPER: 'whisper',
  BROADCAST: 'broadcast',
  MESSAGE: 'message',
};

export const sendMessage = async ({ text, roomId, image }) => {
  const room = getRoom(store.getState(), { roomId });
  const participantIds = room.isWhisper
    ? room.participantIds
    : [];
  const message = {
    text,
    roomId,
  };

  console.log(message);

  if (room.isUser) {
    message.messageType = MessageType.WHISPER;
    participantIds.push(getIdentityId(store.getState()));
    participantIds.push(roomId);
  } else if (room.isWhisper) {
    message.messageType = MessageType.WHISPER;
  } else {
    message.messageType = MessageType.CHAT;
  }

  return emitSocketEvent(CreateEvents.MESSAGE, {
    message,
    image,
    participantIds,
  });
};
