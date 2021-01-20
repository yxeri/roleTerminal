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
import { hasAccessTo } from '../../../AccessCentral';

import { ReactComponent as Unlock } from '../../../icons/unlock.svg';

const JoinRoomDialog = ({
  roomId,
  id,
  index,
  password,
  messageId,
}) => {
  const [error, setError] = useState();
  const room = useSelector((state) => getRoomById(state, { id: roomId }));
  const user = useSelector(getCurrentUser);
  const methods = useForm();

  const { hasAccess } = hasAccessTo({
    objectToAccess: room,
    toAuth: user,
  });

  const onSubmit = ({
    password: submittedPassword,
  } = {}) => {
    followRoom({ roomId, password: submittedPassword })
      .then(() => {
        batch(() => {
          store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT, roomId, messageId } }] }));
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
      id={id}
      error={error}
      index={index}
      className="JoinRoomDialog"
      onClick={() => {
        store.dispatch(changeWindowOrder({
          windows: [{
            id,
            value: {
              roomId,
              password,
              messageId,
              type: WindowTypes.DIALOGJOINROOM,
            },
          }],
        }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      title={hasAccess || !room.password ? `Join room ${room.roomName}` : `Unlock room ${room.roomName}`}
      buttons={[
        <Button
          stopPropagation
          type="submit"
          onClick={() => methods.handleSubmit(onSubmit)()}
        >
          {!hasAccess && room.password && (
            <Unlock />
          )}
          <span>{hasAccess || !room.password ? 'Join' : 'Unlock'}</span>
        </Button>,
      ]}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div>
            {(hasAccess || !room.password) && (
              <>
                <p>{`Do you want to join the room ${room.roomName}?`}</p>
                {room.topic && (
                  <p>{`Topic: ${room.topic}`}</p>
                )}
              </>
            )}
            {!hasAccess && room.password && (
              <>
                <p>The room is locked.</p>
                <p>Enter the password to continue:</p>
              </>
            )}
          </div>
          {!hasAccess && room.password && (
            <Input
              defaultValue={password}
              required={!hasAccess}
              minLength={4}
              maxLength={100}
              name="password"
              type="password"
              placeholder="Password"
            />
          )}
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
  password: string,
  messageId: string,
};

JoinRoomDialog.defaultProps = {
  password: undefined,
  messageId: undefined,
};
