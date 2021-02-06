import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import ListItem from '../../../common/lists/List/Item/ListItem';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import FileMenu from '../../../common/lists/FileMenu/FileMenu';
import { getRoomById } from '../../../../redux/selectors/rooms';
import { getCurrentUser } from '../../../../redux/selectors/users';
import { hasAccessTo } from '../../../../AccessCentral';
import { ReactComponent as Tool } from '../../../../icons/tool.svg';
import { ReactComponent as Plus } from '../../../../icons/plus.svg';
import { ReactComponent as LogOut } from '../../../../icons/log-out.svg';
import { ReactComponent as ChatIcon } from '../../../../icons/chat.svg';

const ChatFileMenu = ({ id, roomId }) => {
  const currentUser = useSelector(getCurrentUser);
  const room = useSelector((state) => getRoomById(state, { id: roomId }));

  const onCreateRoom = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEROOM, value: { type: WindowTypes.DIALOGCREATEROOM } }] })), []);

  const { hasFullAccess } = hasAccessTo({
    objectToAccess: room,
    toAuth: currentUser,
  });

  return (
    <FileMenu
      menuIcon={<ChatIcon />}
      key="fileMenu"
      id={id}
    >
      {!currentUser.isAnonymous && (
        <>
          <ListItem
            stopPropagation
            key="createRoom"
            onClick={onCreateRoom}
          >
            <Plus />
            New room
          </ListItem>
          <ListItem
            stopPropagation
            key="configRoom"
            onClick={() => {}}
          >
            <Tool />
            {`${room.roomName} settings`}
          </ListItem>
        </>
      )}
      {room && !room.isWhisper && !room.isUser && !room.isSystemRoom && !room.isTeam && (
        <ListItem
          key="leaveRoom"
          onClick={() => {}}
        >
          <LogOut />
          {`Leave ${room.roomName}`}
        </ListItem>
      )}
      {hasFullAccess && room && !room.isWhisper && !room.isUser && !room.isSystemRoom && !room.isTeam && (
        <ListItem
          stopPropagation
          key="removeRoom"
          onClick={() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGREMOVEROOM, value: { type: WindowTypes.DIALOGREMOVEROOM, roomId } }] }))}
        >
          {`Delete ${room.roomName}`}
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
