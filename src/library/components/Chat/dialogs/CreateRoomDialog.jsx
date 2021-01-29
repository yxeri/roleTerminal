import React, { useEffect, useState } from 'react';
import { number, string } from 'prop-types';
import { batch } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../common/dialogs/Dialog/Dialog';
import Input from '../../common/sub-components/Input/Input';
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
      id={id}
      index={index}
      className="CreateRoomDialog"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATEROOM } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      title="New room"
      buttons={[
        <Button
          type="submit"
          onClick={() => methods.handleSubmit(onSubmit)()}
        >
          Create
        </Button>,
      ]}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="identity">
            <span>You are: </span>
            <IdentityPicker />
          </div>
          <Input
            required
            label="Name of the room"
            maxLength={20}
            name="roomName"
            placeholder="Name"
          />
          <Input
            label="Topic (shown when joining the room)"
            maxLength={300}
            name="topic"
            placeholder="Topic"
          />
          <Input
            label="Optional password"
            minLength={4}
            maxLength={100}
            name="password"
            type="password"
            placeholder="Password"
          />
          <Input
            label="Repeat password"
            minLength={4}
            maxLength={100}
            shouldEqual="password"
            name="repeatPassword"
            type="password"
            placeholder={`${methods.errors.repeatPassword ? 'Error. Passwords must match!' : 'Repeat password'}`}
          />
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
