import React, { useState } from 'react';
import { func } from 'prop-types';
import Dialog from '../../common/dialogs/Dialog';
import Input from '../../common/sub-components/Input';
import { emitSocketEvent } from '../../../SocketManager';

export default function CreateRoomDialog({ done }) {
  const [roomName, setRoomName] = useState();
  const [password, setPassword] = useState();
  const [repeatPassword, setRepeatPassword] = useState();
  const [topic, setTopic] = useState();
  const [error, setError] = useState();

  return (
    <Dialog
      done={done}
      error={error}
      title="New room"
    >
      <Input
        required
        onChange={setRoomName}
        placeholder="Name of the room"
      />
      <Input
        onChange={setTopic}
        placeholder="Topic (shown when joining the room)"
      />
      <Input
        onChange={setPassword}
        type="password"
        placeholder="Password"
      />
      <Input
        onChange={setRepeatPassword}
        type="password"
        placeholder="Repeat password"
      />
      <button
        type="submit"
        onClick={() => {
          if (!roomName) {
            return;
          }

          if (password && password !== repeatPassword) {
            return;
          }

          const room = {
            roomName,
            password,
            topic,
          };

          emitSocketEvent('createRoom', { room }, ({ error: roomError }) => {
            if (roomError) {
              setError(roomError);

              return;
            }

            // TODO Notification: Room created

            done();
          });
        }}
      >
        Create
      </button>
    </Dialog>
  );
}

CreateRoomDialog.propTypes = {
  done: func.isRequired,
};
