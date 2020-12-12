import React, { useState } from 'react';
import { func, number } from 'prop-types';
import { useSelector } from 'react-redux';
import Rooms from './views/Rooms';
import Messages from './views/Messages';
import Window from '../common/Window/Window';
import FileMenu from '../common/lists/FileMenu';
import CreateRoomDialog from './dialogs/CreateRoomDialog';
import RemoveRoomDialog from './dialogs/RemoveRoomDialog';
import { getRoom } from '../../redux/selectors/rooms';
import { createDialog } from '../helper';

import './Chat.scss';
import ListItem from '../common/sub-components/List/ListItem/ListItem';

export default function Chat({ onClick, order }) {
  const [dialog, setDialog] = useState();
  const [roomId, setRoomId] = useState();
  const room = useSelector((state) => getRoom(state, { roomId }));

  return (
    <>
      <Window
        order={order}
        title={`${room ? room.roomName : 'CHAT'}`}
        onClick={onClick}
        menu={(
          <>
            <FileMenu>
              <ListItem
                key="createRoom"
                onClick={() => setDialog(createDialog(<CreateRoomDialog done={() => setDialog()} />))}
              >
                New room
              </ListItem>
              <ListItem
                key="removeRoom"
                onClick={() => setDialog(createDialog(<RemoveRoomDialog roomId={roomId} done={() => setDialog()} />))}
              >
                Delete room
              </ListItem>
            </FileMenu>
            <Rooms onChange={setRoomId} />
          </>
        )}
      >
        <Messages roomId={roomId} />
      </Window>
      {dialog}
    </>
  );
}

Chat.propTypes = {
  onClick: func.isRequired,
  order: number.isRequired,
};
