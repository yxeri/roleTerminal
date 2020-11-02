import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { func, number } from 'prop-types';
import { useSelector } from 'react-redux';
import Rooms from './views/Rooms';
import Messages from './views/Messages';
import Window from '../common/views/Window';
import FileMenu from '../common/lists/FileMenu';
import CreateRoomDialog from './dialogs/CreateRoomDialog';
import RemoveRoomDialog from './dialogs/RemoveRoomDialog';
import { getRoom } from '../../redux/selectors/rooms';

export default function Chat({ onClick, order }) {
  const [dialog, setDialog] = useState();
  const [roomId, setRoomId] = useState();
  const room = useSelector((state) => getRoom(state, { roomId }));
  const main = document.querySelector('#main');

  return (
    <>
      <Window
        order={order}
        title={`chat ${room ? room.roomName : ''}`}
        onClick={onClick}
      >
        <div className="lists">
          <FileMenu
            items={[
              {
                key: 'createRoom',
                value: 'New room',
                onClick: () => setDialog(createPortal(<CreateRoomDialog done={() => setDialog()} />, main)),
              }, {
                key: 'removeRoom',
                value: 'Delete room',
                onClick: () => setDialog(createPortal(<RemoveRoomDialog roomId={roomId} done={() => setDialog()} />, main)),
              },
            ]}
          />
          <Rooms onChange={setRoomId} />
        </div>
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
