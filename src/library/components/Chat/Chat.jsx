import React, { useCallback, useEffect, useState } from 'react';
import { number, string } from 'prop-types';
import { useSelector } from 'react-redux';

import Rooms from './views/Rooms';
import Messages from './views/Messages/Messages';
import Window from '../common/Window/Window';
import { getRoomById, getWhisperRoomNames } from '../../redux/selectors/rooms';
import { getPublicRoomId } from '../../redux/selectors/config';
import store from '../../redux/store';
import { getCurrentUserIdentitiesNames, getIdentityById, getIsAnonymous } from '../../redux/selectors/users';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import { ReactComponent as Close } from '../../icons/close.svg';
import { ReactComponent as Maximize } from '../../icons/maximize.svg';
import { ReactComponent as Settings } from '../../icons/settings.svg';
import { ReactComponent as Image } from '../../icons/image.svg';
import { ReactComponent as User } from '../../icons/user.svg';
import { ReactComponent as Lock } from '../../icons/lock.svg';
import { ReactComponent as ChatIcon } from '../../icons/chat.svg';
import ChatFileMenu from './lists/FileMenu/ChatFileMenu';

import './Chat.scss';

const Chat = ({
  id,
  index,
  roomId,
  messageId,
}) => {
  const [currentRoomId, setRoomId] = useState(roomId || getPublicRoomId(store.getState()));
  const room = useSelector((state) => getRoomById(state, { id: currentRoomId }));
  const isAnonymous = useSelector(getIsAnonymous);

  useEffect(() => {
    if ((isAnonymous || !room) && currentRoomId !== getPublicRoomId(store.getState())) {
      setRoomId(getPublicRoomId(store.getState()));
    }
  }, [room, isAnonymous]);

  useEffect(() => {
    if (roomId && currentRoomId !== roomId) {
      setRoomId(roomId);
    }
  }, [roomId]);

  const title = (() => {
    if (!room) {
      return '';
    }

    if (room.isUser) {
      const identity = getIdentityById(store.getState(), { id: currentRoomId });

      return `${identity.aliasName || identity.username}`;
    }

    if (room.isWhisper) {
      const identities = getCurrentUserIdentitiesNames(store.getState());
      const names = getWhisperRoomNames(store.getState(), { ids: room.participantIds });

      return identities.length === 1 ? names[1] : `${names[0] > names[1]}`;
    }

    return `${room.roomName}`;
  })();

  const onChange = useCallback(({ roomId: newRoomId } = {}) => {
    setRoomId(newRoomId);
  }, []);

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.CHAT } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  return (
    <Window
      id={id}
      index={index}
      done={onDone}
      className="Chat"
      title={(
        <>
          <ChatIcon />
          <span>{title}</span>
        </>
      )}
      onClick={onClick}
      menu={(
        <>
          <ChatFileMenu roomId={currentRoomId} id={id} />
          <Rooms
            roomId={currentRoomId}
            key="rooms"
            onChange={onChange}
          />
        </>
      )}
      help={(
        <ul>
          <li>
            <p>
              <ChatIcon />
              <span>CHAT APP Read and send messages, to users or rooms.</span>
            </p>
            <p>You can only read the Public chat without logging in.</p>
            <p>Menus are on the left (or top in smaller windows). Messages from the current room are to the right (or below).</p>
            <p>Your current room is shown in the title (CHAT: public) and in JOINED.</p>
          </li>
          <li>
            <p>SEND The message input is shown on the bottom when you are logged in. You can send the message with either alt+Enter or clicking Send.</p>
            <p>
              <Image />
              <span>IMAGE Attach an image. You can send a message with just an image.</span>
            </p>
            <p>
              <User />
              <span>YOU Your name. Click it to switch identities.</span>
            </p>
          </li>
          <li>
            <p>
              FILE You can create a room, change settings (like changing password or name) or remove the room you are in.
            </p>
            <p>JOINED Shows you the rooms you joined. Click one to switch to it.</p>
            <p>PM All private conversations are shown here. It always shows your name on the left.</p>
            <p>
              <span>{'ROOMS All available rooms that you haven\'t joined yet.'}</span>
              <Lock />
              <span> means that the room is password-protected.</span>
            </p>
            <p>
              <span>USERS All users. Send a private message to a user by clicking them and choosing </span>
              <ChatIcon />
              <span> in the pop-up.</span>
            </p>
          </li>
          <li>
            <Settings />
            <span>APP SETTINGS Change settings for this app. You have to be logged in to access it.</span>
          </li>
          <li>
            <Maximize />
            <span>MAXIMIZE Make the window expand and take up all available space. Clicking it again will shrink the window.</span>
          </li>
          <li>
            <Close />
            <span>CLOSE Close the window</span>
          </li>
        </ul>
      )}
    >
      <Messages
        key="messages"
        messageId={messageId}
        roomId={currentRoomId}
        onSend={onChange}
      />
    </Window>
  );
};

export default React.memo(Chat);

Chat.propTypes = {
  id: string.isRequired,
  roomId: string,
  index: number.isRequired,
  messageId: string,
};

Chat.defaultProps = {
  roomId: undefined,
  messageId: undefined,
};
