import { SendEvents, emitSocketEvent } from '../SocketManager';
import { getRoom } from '../../redux/selectors/rooms';
import store from '../../redux/store';
import { getIdentityId } from '../../redux/selectors/userId';
import { createMessages } from '../../redux/actions/messages';

const MessageType = {
  CHAT: 'chat',
  WHISPER: 'whisper',
  BROADCAST: 'broadcast',
  MESSAGE: 'message',
};

export const sendMessage = async ({ text, roomId, image }) => {
  const room = getRoom(store.getState(), roomId);
  const participantIds = room.isWhisper
    ? room.participantIds
    : [];
  const message = {
    text,
    roomId,
  };

  if (room.isUser) {
    message.messageType = MessageType.WHISPER;
    participantIds.push(getIdentityId(store.getState()));
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
};
