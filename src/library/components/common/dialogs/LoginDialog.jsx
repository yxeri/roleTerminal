import React, { useState } from 'react';
import { func } from 'prop-types';
import Dialog from './Dialog/Dialog';
import { login } from '../../../SocketManager';
import Input from '../sub-components/Input';
import Button from '../sub-components/Button/Button';

export default function LoginDialog({ done }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState();

  const onSubmit = async () => {
    login(username, password)
      .then(() => {
        // TODO Notification: You are logged in
        done();
      })
      .catch((loginError) => {
        setError(loginError);
      });
  };

  return (
    <Dialog
      done={done}
      error={error}
      title="Login"
    >
      <Input
        placeholder="Username"
        onChange={setUsername}
      />
      <Input
        placeholder="Password"
        onChange={setPassword}
        type="password"
      />
      <Button
        type="submit"
        onClick={onSubmit}
      >
        Login
      </Button>
    </Dialog>
  );
}

LoginDialog.propTypes = {
  done: func.isRequired,
};
