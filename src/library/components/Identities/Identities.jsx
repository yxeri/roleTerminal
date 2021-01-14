import React, { useCallback, useEffect, useState } from 'react';
import { number, string } from 'prop-types';
import { useSelector } from 'react-redux';

import Rooms from './views/Rooms';
import Messages from './views/Messages/Messages';
import Window from '../common/Window/Window';
import { getRoomById, getWhisperRoomName } from '../../redux/selectors/rooms';
import { getPublicRoomId } from '../../redux/selectors/config';
import store from '../../redux/store';
import { getIdentityById, getIsAnonymous } from '../../redux/selectors/users';
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
  identityId,
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
      return 'Chat';
    }

    if (room.isUser) {
      const identity = getIdentityById(store.getState(), { id: currentRoomId });

      return `PM: ${identity.aliasName || identity.username}`;
    }

    if (room.isWhisper) {
      return `PM: ${getWhisperRoomName(store.getState(), { ids: room.participantIds })}`;
    }

    return `Chat: ${room.roomName}`;
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
      title={title}
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
    >
    </Window>
  );
};

export default React.memo(Chat);

Chat.propTypes = {
  id: string.isRequired,
  identityId: string,
  index: number.isRequired,
};

Chat.defaultProps = {
  identityId: undefined,
};
