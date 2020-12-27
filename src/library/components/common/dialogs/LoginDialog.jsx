import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from './Dialog/Dialog';
import { login } from '../../../socket/actions/auth';
import Input from '../sub-components/Input';
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

  return (
    <Dialog
      index={index}
      classNames={['LoginDialog']}
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGLOGIN } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      error={error}
      title="Login"
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
          <div className="buttons">
            <Button
              type="submit"
              onClick={() => {}}
            >
              Login
            </Button>
          </div>
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
