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
import { changeWindowOrder } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

const Chat = ({ id }) => {
  const [dialog, setDialog] = useState();
  const [roomId, setRoomId] = useState(getPublicRoomId(store.getState()));
  const room = useSelector((state) => getRoom(state, { id: roomId }));
  const currentUser = useSelector(getCurrentUser);

  useEffect(() => {
    if ((!currentUser || currentUser.isAnonymous || !room) && roomId !== getPublicRoomId(store.getState())) {
      setRoomId(getPublicRoomId(store.getState()));
    }
  }, [room, currentUser]);

  const title = (() => {
    if (!room) {
      return 'Chat';
    }

    if (room.isUser) {
      const identity = getIdentityById(store.getState(), { id: roomId });

      return `PM: ${identity.aliasName || identity.username}`;
    }

    if (room.isWhisper) {
      return `PM: ${getWhisperRoomName(store.getState(), { ids: room.participantIds })}`;
    }

    return `Chat: ${room.roomName}`;
  })();

  const onChange = useCallback(({ roomId: newRoomId } = {}) => {
    if (newRoomId) {
      setRoomId(newRoomId);
    }
  }, []);

  const onDialog = useCallback(setDialog, []);

  const createRoomDialog = useCallback(() => setDialog(createDialog(
    <CreateRoomDialog
      done={
        ({ roomId: newRoomId }) => {
          setDialog();

          if (newRoomId) {
            setRoomId(newRoomId);
          }
        }
      }
    />,
  )), []);

  const createRemoveDialog = useCallback(() => setDialog(createDialog(
    <RemoveRoomDialog roomId={roomId} done={() => setDialog()} />,
  )), [roomId]);

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.CHAT } }] }));
  }, []);

  return (
    <>
      <Window
        classNames={['Chat']}
        title={title}
        onClick={onClick}
        menu={(
          <>
            <FileMenu key="fileMenu">
              <ListItem
                key="createRoom"
                onClick={createRoomDialog}
              >
                New room
              </ListItem>
              {hasAccessTo({
                objectToAccess: room,
                toAuth: currentUser,
              }).hasFullAccess && (
                <>
                  <ListItem
                    key="configRoom"
                    onClick={() => setDialog(createDialog(<RemoveRoomDialog roomId={roomId} done={() => setDialog()} />))}
                  >
                    Config room
                  </ListItem>
                  <ListItem
                    key="removeRoom"
                    onClick={createRemoveDialog}
                  >
                    Delete room
                  </ListItem>
                </>
              )}
            </FileMenu>
            <Rooms
              key="rooms"
              onChange={onChange}
              onDialog={onDialog}
            />
          </>
        )}
      >
        <Messages
          key="messages"
          roomId={roomId}
          onDialog={onDialog}
          onSend={onChange}
        />
      </Window>
      {dialog}
    </>
  );
};

export default React.memo(Chat);

Chat.propTypes = {
  id: string.isRequired,
};
