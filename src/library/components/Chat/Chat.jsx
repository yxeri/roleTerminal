import React, { useCallback, useEffect, useState } from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';
import Rooms from './views/Rooms';
import Messages from './views/Messages/Messages';
import Window from '../common/Window/Window';
import FileMenu from '../common/lists/FileMenu';
import CreateRoomDialog from './dialogs/CreateRoomDialog';
import RemoveRoomDialog from './dialogs/RemoveRoomDialog';
import { getRoom, getWhisperRoomName } from '../../redux/selectors/rooms';
import { createDialog } from '../helper';

import './Chat.scss';
import ListItem from '../common/lists/List/Item/ListItem';
import { getPublicRoomId } from '../../redux/selectors/config';
import store from '../../redux/store';
import { getCurrentUser, getIdentityById } from '../../redux/selectors/users';
import { hasAccessTo } from '../../AccessCentral';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

const Chat = ({ id, roomId }) => {
  const [currentRoomId, setRoomId] = useState(roomId || getPublicRoomId(store.getState()));
  const room = useSelector((state) => getRoom(state, { id: currentRoomId }));
  const currentUser = useSelector(getCurrentUser);

  useEffect(() => {
    if ((!currentUser || currentUser.isAnonymous || !room) && currentRoomId !== getPublicRoomId(store.getState())) {
      setRoomId(getPublicRoomId(store.getState()));
    }
  }, [room, currentUser]);

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

  const onCreateRoom = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEROOM, value: { type: WindowTypes.DIALOGCREATEROOM } }] })), []);

  const { hasFullAccess } = hasAccessTo({
    objectToAccess: room,
    toAuth: currentUser,
  });

  return (
    <Window
      done={onDone}
      classNames={['Chat']}
      title={title}
      onClick={onClick}
      menu={(
        <>
          {!currentUser.isAnonymous && (
            <FileMenu key="fileMenu">
              <ListItem
                stopPropagation
                key="createRoom"
                onClick={onCreateRoom}
              >
                New room
              </ListItem>
              {hasFullAccess && (
                <ListItem
                  stopPropagation
                  key="configRoom"
                  onClick={() => {}}
                >
                  Config room
                </ListItem>
              )}
              {hasFullAccess && !room.isWhisper && !room.isUser && !room.isSystemRoom && !room.isTeam && (
                <ListItem
                  stopPropagation
                  key="removeRoom"
                  onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGREMOVEROOM, value: { type: WindowTypes.DIALOGREMOVEROOM, roomId: currentRoomId } }] }))}
                >
                  Delete room
                </ListItem>
              )}
            </FileMenu>
          )}
          <Rooms
            key="rooms"
            onChange={onChange}
          />
        </>
      )}
    >
      <Messages
        key="messages"
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
};

Chat.defaultProps = {
  roomId: undefined,
};
