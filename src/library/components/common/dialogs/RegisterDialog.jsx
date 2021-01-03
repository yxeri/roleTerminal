import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from './Dialog/Dialog';
import { login } from '../../../socket/actions/auth';
import Select from '../sub-components/Select/Select';
import Input from '../sub-components/Input/Input';
import Textarea from '../sub-components/Textarea/Textarea';
import { getRequireOffName } from '../../../redux/selectors/config';
import Button from '../sub-components/Button/Button';
import { createUser } from '../../../socket/actions/users';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';

const RegisterDialog = ({ id, index }) => {
  const formMethods = useForm();
  const [image, setImage] = useState();
  const [error, setError] = useState();
  const requireOffName = useSelector(getRequireOffName);

  const onSubmit = async ({
    offName,
    username,
    password,
    repeatPassword,
    pronouns,
    description,
  }) => {
    if ((requireOffName && !offName) || !username || !password || !repeatPassword || !pronouns) {
      return;
    }

    if (password !== repeatPassword) {
      return;
    }

    const params = {
      image,
      user: {
        offName,
        username,
        password,
        pronouns,
        description: description ? description.split('\n') : undefined,
      },
    };

    try {
      await createUser(params);

      // TODO If no auto-login, Notification: User registered

      await login(username, password);

      // TODO Notification: You are logged in as user

      store.dispatch(removeWindow({ id }));
    } catch (registerError) {
      setError(registerError);
    }
  };

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGREGISTER } }] }));
  }, [id]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onSubmitCall = useCallback(() => formMethods.handleSubmit(onSubmit)(), []);

  return (
    <Dialog
      id={id}
      index={index}
      error={error}
      onClick={onClick}
      done={onDone}
      title="Register user"
      buttons={[
        <Button
          type="submit"
          onClick={onSubmitCall}
        >
          Register
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {
            requireOffName && (
              <Input
                required
                name="offName"
                placeholder="Out-of-game name"
              />
            )
          }
          <Input
            required
            name="username"
            placeholder="Username"
          />
          <Select
            multiple
            required
            name="pronouns"
          >
            <option value="">---Choose pronouns---</option>
            <option value="they">They/Them</option>
            <option value="she">She/Her</option>
            <option value="he">He/Him</option>
            <option value="it">It</option>
          </Select>
          <Input
            required
            name="password"
            placeholder="Password"
            type="password"
          />
          <Input
            required
            shouldEqual="password"
            name="repeatPassword"
            placeholder="Repeat password"
            type="password"
          />
          <Textarea
            name="description"
            placeholder="Description"
          />
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(RegisterDialog);

RegisterDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
