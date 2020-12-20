import React, { useState } from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';
import Dialog from '../../common/dialogs/Dialog/Dialog';
import { getRoom } from '../../../redux/selectors/rooms';
import Button from '../../common/sub-components/Button/Button';
import { removeRoom } from '../../../socket/actions/rooms';

const RemoveRoomDialog = ({ done, roomId }) => {
  const [error, setError] = useState();
  const room = useSelector((state) => getRoom(state, { id: roomId }));

  const onSubmit = () => {
    removeRoom({ roomId })
      .then(() => done())
      .catch((removeError) => setError(removeError));
  };

  return (
    <Dialog
      classNames={['RemoveRoomDialog']}
      error={error}
      done={done}
      title={`Delete room ${room ? room.roomName : ''}`}
      text={`Are you sure you want to delete ${room ? room.roomName : ''}?`}
    >
      <Button
        type="button"
        onClick={() => done()}
      >
        No
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
      >
        Yes
      </Button>
    </Dialog>
  );
};

export default React.memo(RemoveRoomDialog);

RemoveRoomDialog.propTypes = {
  done: func.isRequired,
  roomId: string.isRequired,
};
