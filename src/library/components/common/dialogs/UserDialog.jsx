import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import Dialog from './Dialog/Dialog';
import { getIdentityById } from '../../../redux/selectors/users';
import Button from '../sub-components/Button/Button';

const UserDialog = ({ userId, done }) => {
  const user = useSelector((state) => getIdentityById(state, { identityId: userId }));

  return (
    <Dialog
      done={done}
    >
      <Button
        type="button"
        onClick={() => {
          done();
        }}
      >
        Message
      </Button>
    </Dialog>
  );
};

export default React.memo(UserDialog);

UserDialog.propTypes = {
  done: func.isRequired,
  userId: string.isRequired,
};
