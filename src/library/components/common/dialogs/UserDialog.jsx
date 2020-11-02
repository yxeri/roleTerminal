import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import Dialog from './Dialog';
import { getIdentity } from '../../../redux/selectors/users';

export default function UserDialog({ userId, done }) {
  const user = useSelector((state) => getIdentity(state, { identityId: userId }));

  return (
    <Dialog
      done={done}
    >
      <button
        type="button"
        onClick={() => {
          done();
        }}
      >
        Message
      </button>
    </Dialog>
  );
}

UserDialog.propTypes = {
  done: func.isRequired,
  userId: string.isRequired,
};
