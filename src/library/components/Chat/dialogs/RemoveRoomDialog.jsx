import React, { useState } from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';
import Dialog from '../../common/dialogs/Dialog';
import { getRoom } from '../../../redux/selectors/rooms';
import { emitSocketEvent } from '../../../SocketManager';

export default function RemoveRoomDialog({ done, roomId }) {
  const [error, setError] = useState();
  const room = useSelector((state) => getRoom(state, { roomId }));

  return (
    <Dialog
      error={error}
      done={done}
      title={`Delete room ${room.roomName}`}
      text={`Are you sure you want to delete ${room.roomName}?`}
    >
      <button
        type="button"
        onClick={() => done()}
      >
        No
      </button>
      <button
        type="button"
        onClick={() => {
          emitSocketEvent('removeRoom', { roomId }, ({ error: roomError }) => {
            if (roomError) {
              setError(roomError);

              return;
            }

            done();
          });
        }}
      >
        Yes
      </button>
    </Dialog>
  );
}

RemoveRoomDialog.propTypes = {
  done: func.isRequired,
  roomId: string.isRequired,
};
