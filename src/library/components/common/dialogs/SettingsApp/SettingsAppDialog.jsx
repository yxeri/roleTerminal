import React, { useState } from 'react';
import {
  node,
  number,
  shape,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import { getCurrentUser } from '../../../../redux/selectors/users';
import store from '../../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../../redux/actions/windowOrder';
import { updateUser } from '../../../../socket/actions/users';
import Dialog from '../Dialog/Dialog';
import Button from '../../sub-components/Button/Button';
import Input from '../../sub-components/Input/Input';
import Select from '../../sub-components/selects/Select/Select';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import { ReactComponent as Settings } from '../../../../icons/settings.svg';

const SettingsAppDialog = ({
  id,
  index,
  windowType,
  inputs,
}) => {
  const currentUser = useSelector(getCurrentUser);
  const formMethods = useForm();
  const [error, setError] = useState();
  const { systemConfig = { [windowType]: {} } } = currentUser;

  const onSubmit = ({
    expand,
    hideTopBar,
  }) => {
    updateUser({
      userId: currentUser.objectId,
      user: {
        systemConfig: {
          ...systemConfig,
          [windowType]: {
            ...systemConfig[windowType],
            expand,
            hideTopBar,
          },
        },
      },
    })
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((updateError) => console.log(updateError));
  };

  const isWider = window.innerWidth > window.innerHeight;
  const smallHeight = window.innerHeight < 450;
  const smallWidth = window.innerWidth < 450;

  return (
    <Dialog
      id={id}
      index={index}
      className="SettingsAppDialog configDialog"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: `${WindowTypes.DIALOGAPPSETTINGS} ${windowType}` } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      error={error}
      title={(
        <>
          <Settings />
          <span>{windowType}</span>
        </>
      )}
      buttons={[
        <Button
          key="submit"
          type="submit"
          onClick={() => formMethods.handleSubmit(onSubmit)()}
        >
          Update
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Input
            label="Hide top row? (Window will be auto-maximized. You can close and change settings for the window in its menu)?"
            type="checkbox"
            name="hideTopBar"
            checked={systemConfig.hideTopBar}
          />
          <Select
            label="Automatically expand and place window?"
            defaultValue={systemConfig[windowType].expand}
            name="expand"
          >
            <option value="">No</option>
            <option value="maximize">Maximize</option>
            {isWider && (
              <>
                <option value="left">Left half</option>
                <option value="right">Right half</option>
              </>
            )}
            {!isWider && (
              <>
                <option value="upper">Upper half</option>
                <option value="lower">Lower half</option>
              </>
            )}
            {!smallHeight && !smallWidth && (
              <>
                <option value="upperLeft">Upper left corner</option>
                <option value="upperRight">Upper right corner</option>
                <option value="lowerLeft">Lower left corner</option>
                <option value="lowerRight">Lower right corner</option>
              </>
            )}
          </Select>
          {inputs.map(({ element }) => ({ element }))}
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(SettingsAppDialog);

SettingsAppDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
  windowType: string.isRequired,
  inputs: shape({ name: string, element: node }),
};

SettingsAppDialog.defaultProps = {
  inputs: undefined,
};
