import React, { useState } from 'react';
import { string } from 'prop-types';
import { batch } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../common/dialogs/Dialog/Dialog';
import Input from '../../common/sub-components/Input';
import Button from '../../common/sub-components/Button/Button';
import { createRoom } from '../../../socket/actions/rooms';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';

const CreateRoomDialog = ({ id }) => {
  const methods = useForm();
  const [error, setError] = useState();

  const onSubmit = ({
    roomName,
    password,
    repeatPassword,
    topic,
  }) => {
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

    createRoom({ room })
      .then(({ room: newRoom }) => {
        batch(() => {
          store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT, roomId: newRoom.objectId } }] }));
          store.dispatch(removeWindow({ id }));
        });
      })
      .catch((createError) => console.log(createError));
  };

  return (
    <Dialog
      classNames={['CreateRoomDialog']}
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATEROOM } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      error={error}
      title="New room"
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Input
            required
            name="roomName"
            placeholder="Name of the room"
          />
          <Input
            name="topic"
            placeholder="Topic (shown when joining the room)"
          />
          <Input
            name="password"
            type="password"
            placeholder="Password"
          />
          <Input
            name="repeatPassword"
            type="password"
            placeholder="Repeat password"
          />
          <div className="buttons">
            <Button
              type="submit"
              onClick={() => {}}
            >
              Create
            </Button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(CreateRoomDialog);

CreateRoomDialog.propTypes = {
  id: string.isRequired,
};
