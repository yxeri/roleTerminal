import React, { useCallback, useState } from 'react';
import { number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from './Dialog/Dialog';
import { login } from '../../../socket/actions/auth';
import Input from '../sub-components/Input/Input';
import Button from '../sub-components/Button/Button';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';

const LoginDialog = ({ id, index }) => {
  const methods = useForm();
  const [error, setError] = useState();

  const onSubmit = async ({
    username,
    password,
  }) => {
    login(username, password)
      .then(() => {
        // TODO Notification: You are logged in
        store.dispatch(removeWindow({ id }));
      })
      .catch((loginError) => {
        setError(loginError);
      });
  };

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGLOGIN } }] }));
  }, [id]);

  const onSubmitCall = useCallback(() => methods.handleSubmit(onSubmit)(), []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  return (
    <Dialog
      id={id}
      index={index}
      className="LoginDialog"
      onClick={onClick}
      done={onDone}
      error={error}
      title="Login"
      buttons={[
        <Button
          key="submit"
          type="submit"
          onClick={onSubmitCall}
        >
          Login
        </Button>,
      ]}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Input
            name="username"
            placeholder="Username"
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
          />
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(LoginDialog);

LoginDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
