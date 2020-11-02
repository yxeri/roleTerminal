import React, { useEffect, useState } from 'react';
import { func } from 'prop-types';
import Dialog from './Dialog';
import { login } from '../../../SocketManager';
import Input from '../sub-components/Input';

export default function LoginDialog({ done }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState();

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
      <button
        type="submit"
        onClick={() => {
          login(username, password, ({ error: loginError }) => {
            if (loginError) {
              setError(loginError);

              return;
            }

            // TODO Notification: You are logged in

            done();
          });
        }}
      >
        Login
      </button>
    </Dialog>
  );
}

LoginDialog.propTypes = {
  done: func.isRequired,
};
