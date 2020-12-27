import React, { useEffect, useState } from 'react';
import { number, string } from 'prop-types';
import { batch } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../common/dialogs/Dialog/Dialog';
import Input from '../../common/sub-components/Input';
import Button from '../../common/sub-components/Button/Button';
import { createRoom } from '../../../socket/actions/rooms';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import IdentityPicker from '../../common/lists/IdentityPicker/IdentityPicker';

const CreateRoomDialog = ({ id, index }) => {
  const methods = useForm();

  const onSubmit = ({
    roomName,
    password,
    topic,
  }) => {
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

  if (methods.errors.repeatPassword) {
    methods.setValue('repeatPassword', '');
  }

  return (
    <Dialog
      index={index}
      classNames={['CreateRoomDialog']}
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATEROOM } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      title="New room"
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="identity">
            <span>You are: </span>
            <IdentityPicker />
          </div>
          <Input
            required
            maxLength={20}
            name="roomName"
            placeholder="Name of the room"
          />
          <Input
            maxLength={300}
            name="topic"
            placeholder="(opt) Topic (shown when joining the room)"
          />
          <Input
            minLength={4}
            maxLength={100}
            name="password"
            type="password"
            placeholder="(opt) Password"
          />
          <Input
            minLength={4}
            maxLength={100}
            shouldEqual="password"
            name="repeatPassword"
            type="password"
            placeholder={`${methods.errors.repeatPassword ? 'Error. Passwords must match!' : '(opt) Repeat password'}`}
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
  index: number.isRequired,
};
