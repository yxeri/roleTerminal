import React, { useState } from 'react';
import { string } from 'prop-types';
import { batch, useSelector } from 'react-redux';
import Dialog from '../../common/dialogs/Dialog/Dialog';
import { getRoom } from '../../../redux/selectors/rooms';
import Button from '../../common/sub-components/Button/Button';
import { removeRoom } from '../../../socket/actions/rooms';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';

const RemoveRoomDialog = ({ id, roomId }) => {
  const [error, setError] = useState();
  const room = useSelector((state) => getRoom(state, { id: roomId }));

  const onSubmit = () => {
    removeRoom({ roomId })
      .then(() => {
        batch(() => {
          store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT } }] }));
          store.dispatch(removeWindow({ id }));
        });
      })
      .catch((removeError) => setError(removeError));
  };

  return (
    <Dialog
      classNames={['RemoveRoomDialog']}
      error={error}
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGREMOVEROOM, roomId } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      title={`Delete room ${room ? room.roomName : ''}`}
      text={`Are you sure you want to delete ${room ? room.roomName : ''}?`}
    >
      <Button
        type="button"
        onClick={() => store.dispatch(removeWindow({ id }))}
      >
        No
      </Button>
      <Button
        type="submit"
        onClick={onSubmit}
      >
        Yes
      </Button>
    </Dialog>
  );
};

export default React.memo(RemoveRoomDialog);

RemoveRoomDialog.propTypes = {
  id: string.isRequired,
  roomId: string.isRequired,
};
