import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import Dialog from './Dialog/Dialog';
import { getIdentityById } from '../../../redux/selectors/users';
import Button from '../sub-components/Button/Button';
import { getRoom, getWhisperRoom } from '../../../redux/selectors/rooms';
import store from '../../../redux/store';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';

const IdentityDialog = ({ identityId, done }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));
  const currentIdentityId = useSelector(getCurrentIdentityId);

  return (
    <Dialog
      done={done}
    >
      <Button
        type="button"
        onClick={() => {
          const room = getWhisperRoom(store.getState(), { identityId, currentIdentityId }) || getRoom(store.getState(), { id: identityId });

          done({ roomId: room.objectId });
        }}
      >
        Message
      </Button>
    </Dialog>
  );
};

export default React.memo(IdentityDialog);

IdentityDialog.propTypes = {
  done: func.isRequired,
  identityId: string.isRequired,
};
