import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import ListItem from '../../../common/lists/List/Item/ListItem';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import FileMenu from '../../../common/lists/FileMenu';
import { getRoomById } from '../../../../redux/selectors/rooms';
import { getCurrentUser } from '../../../../redux/selectors/users';
import { hasAccessTo } from '../../../../AccessCentral';

const ChatFileMenu = ({ id, roomId }) => {
  const currentUser = useSelector(getCurrentUser);
  const room = useSelector((state) => getRoomById(state, { id: roomId }));

  const onCreateRoom = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEROOM, value: { type: WindowTypes.DIALOGCREATEROOM } }] })), []);

  const { hasFullAccess } = hasAccessTo({
    objectToAccess: room,
    toAuth: currentUser,
  });

  return (
    <FileMenu key="fileMenu" id={id}>
      <ListItem
        stopPropagation
        key="createRoom"
        onClick={onCreateRoom}
      >
        New room
      </ListItem>
      {!currentUser.isAnonymous && (
        <ListItem
          stopPropagation
          key="configRoom"
          onClick={() => {}}
        >
          Manage room
        </ListItem>
      )}
      {room && !room.isWhisper && !room.isUser && !room.isSystemRoom && !room.isTeam && (
        <ListItem
          key="leaveRoom"
          onClick={() => {}}
        >
          Leave room
        </ListItem>
      )}
      {hasFullAccess && room && !room.isWhisper && !room.isUser && !room.isSystemRoom && !room.isTeam && (
        <ListItem
          stopPropagation
          key="removeRoom"
          onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGREMOVEROOM, value: { type: WindowTypes.DIALOGREMOVEROOM, roomId } }] }))}
        >
          Delete room
        </ListItem>
      )}
    </FileMenu>
  );
};

export default ChatFileMenu;

ChatFileMenu.propTypes = {
  id: string.isRequired,
  roomId: string.isRequired,
};
