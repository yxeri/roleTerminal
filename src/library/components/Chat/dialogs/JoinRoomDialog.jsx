import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { batch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../common/dialogs/Dialog/Dialog';
import Input from '../../common/sub-components/Input/Input';
import Button from '../../common/sub-components/Button/Button';
import { followRoom } from '../../../socket/actions/rooms';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import { getRoomById } from '../../../redux/selectors/rooms';
import { getCurrentUser } from '../../../redux/selectors/users';
import IdentityPicker from '../../common/lists/IdentityPicker/IdentityPicker';
import { hasAccessTo } from '../../../AccessCentral';

import { ReactComponent as Unlock } from '../../../icons/unlock.svg';

const JoinRoomDialog = ({ roomId, id, index }) => {
  const [error, setError] = useState();
  const room = useSelector((state) => getRoomById(state, { id: roomId }));
  const user = useSelector(getCurrentUser);
  const methods = useForm();

  const { hasAccess } = hasAccessTo({
    objectToAccess: room,
    toAuth: user,
  });

  const onSubmit = ({
    password,
  } = {}) => {
    followRoom({ roomId, password })
      .then(() => {
        batch(() => {
          store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT, roomId } }] }));
          store.dispatch(removeWindow({ id }));
        });
      })
      .catch((followError) => {
        const newError = {
          ...followError,
        };

        console.log(followError);

        if (followError.type === 'not allowed') {
          newError.message = 'Incorrect password';
        }

        setError(newError);
      });
  };

  return (
    <Dialog
      error={error}
      index={index}
      classNames={['JoinRoomDialog']}
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGJOINROOM, roomId } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      title={!hasAccess ? `Unlock room ${room.roomName}` : `Join room ${room.roomName}`}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="identity">
            <span>You are: </span>
            <IdentityPicker />
          </div>
          <div>
            {hasAccess && (
              <p>{`Do you want to join room ${room.roomName}?`}</p>
            )}
            {hasAccess && room.topic && (
              <p>{`Topic: ${room.topic}`}</p>
            )}
            {!hasAccess && (
              <>
                <p>The room is locked.</p>
                <p>Enter the password to continue:</p>
              </>
            )}
          </div>
          {!hasAccess && (
            <Input
              required={!hasAccess}
              minLength={4}
              maxLength={100}
              name="password"
              type="password"
              placeholder="Password"
            />
          )}
          <div className="buttons">
            <Button
              stopPropagation
              type="button"
              onClick={() => store.dispatch(removeWindow({ id }))}
            >
              {!hasAccess ? 'Cancel' : 'No'}
            </Button>
            <Button
              stopPropagation
              type="submit"
              onClick={() => {}}
            >
              {!hasAccess && (
                <Unlock />
              )}
              <span>{!hasAccess ? 'Unlock' : 'Join'}</span>
            </Button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(JoinRoomDialog);

JoinRoomDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
  roomId: string.isRequired,
};
