import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import Dialog from './Dialog/Dialog';
import { getIdentityById } from '../../../redux/selectors/users';
import Button from '../sub-components/Button/Button';
import { getRoom, getWhisperRoom } from '../../../redux/selectors/rooms';
import store from '../../../redux/store';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';

const IdentityDialog = ({ id, identityId }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));
  const currentIdentityId = useSelector(getCurrentIdentityId);

  return (
    <Dialog
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGIDENTITY } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
    >
      <Button
        type="button"
        onClick={() => {
          const room = getWhisperRoom(store.getState(), { identityId, currentIdentityId }) || getRoom(store.getState(), { id: identityId });

          store.dispatch(removeWindow({ id }));
        }}
      >
        Message
      </Button>
    </Dialog>
  );
};

export default React.memo(IdentityDialog);

IdentityDialog.propTypes = {
  identityId: string.isRequired,
  id: string.isRequired,
};
