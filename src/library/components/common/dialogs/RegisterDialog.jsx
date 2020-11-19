import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import Dialog from './Dialog/Dialog';
import { emitSocketEvent, login } from '../../../SocketManager';
import Select from '../sub-components/Select';
import Input from '../sub-components/Input';
import Textarea from '../sub-components/Textarea';
import { getRequireOffName } from '../../../redux/selectors/config';
import Button from '../sub-components/Button/Button';

export default function RegisterDialog({ done }) {
  const [offName, setOffName] = useState();
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();
  const [repeatPassword, setRepeatPassword] = useState();
  const [description, setDescription] = useState();
  const [pronouns, setPronouns] = useState();
  const [image, setImage] = useState();
  const [error, setError] = useState();
  const requireOffName = useSelector(getRequireOffName);

  const onSubmit = () => {
    if ((requireOffName && !offName) || !username || !password || !repeatPassword || !pronouns) {
      return;
    }

    if (password !== repeatPassword) {
      return;
    }

    emitSocketEvent('register', params, ({ error: registerError }) => {
      if (registerError) {
        setError(registerError);

        return;
      }

      // TODO If no auto-login, Notification: User registered

      login(username, password, ({ error: loginError }) => {
        if (loginError) {
          setError(loginError);
        }

        // TODO Notification: You are logged in as user
      });
    });
  };

  const params = {
    image,
    user: {
      offName,
      username,
      password,
      description,
      pronouns,
    },
  };

  return (
    <Dialog
      error={error}
      done={done}
      title="Register user"
    >
      {
        requireOffName
          && (
            <Input
              placeholder="Out-of-game name"
              onChange={setOffName}
            />
          )
      }
      <Input
        placeholder="Username"
        onChange={setUsername}
      />
      <Select
        multiple
        required
        onChange={setPronouns}
      >
        <option value="">---Choose pronouns---</option>
        <option value="they">They/Them</option>
        <option value="she">She/Her</option>
        <option value="he">He/Him</option>
        <option value="it">It</option>
      </Select>
      <Input
        placeholder="Password"
        onChange={setPassword}
        type="password"
      />
      <Input
        placeholder="Repeat password"
        onChange={setRepeatPassword}
        type="password"
      />
      <Textarea
        placeholder="Description"
        onChange={setDescription}
      />
      <Button
        type="submit"
        onClick={onSubmit}
      >
        Register
      </Button>
    </Dialog>
  );
}

RegisterDialog.propTypes = {
  done: func.isRequired,
};
