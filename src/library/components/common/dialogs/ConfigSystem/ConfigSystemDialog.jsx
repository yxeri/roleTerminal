import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { number, string } from 'prop-types';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import Dialog from '../Dialog/Dialog';
import store from '../../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import { getCurrentUser } from '../../../../redux/selectors/users';
import Input from '../../sub-components/Input/Input';
import { updateUser } from '../../../../socket/actions/users';
import Button from '../../sub-components/Button/Button';
import Select from '../../sub-components/Select/Select';
import { getDeviceId } from '../../../../StorageManager';

import './ConfigSystemDialog.scss';

const ConfigSystemDialog = ({ id, index }) => {
  const formMethods = useForm();
  const currentUser = useSelector(getCurrentUser);
  const onDevice = useWatch({ control: formMethods.control, name: 'onDevice', defaultValue: '' });
  const systemConfig = onDevice === 'this' && currentUser.systemConfig ? (currentUser.systemConfig[getDeviceId()] || {}) : currentUser.systemConfig || {};

  console.log(onDevice);

  const onSubmit = ({
    hideHelp,
    hideTopBar,
    alwaysMaximized,
    hideMenuBar,
    openApps,
    removeDeviceConfig,
  }) => {
    let config;

    if (!removeDeviceConfig) {
      const deviceConfig = systemConfig[getDeviceId()] || {};
      config = onDevice === 'this'
        ? {
          ...systemConfig,
          [getDeviceId()]: {
            ...deviceConfig,
            hideHelp,
            hideTopBar,
            alwaysMaximized,
            hideMenuBar,
            openApps: openApps.map((type) => ({ id: type, value: { type } })),
          },
        }
        : {
          ...systemConfig,
          hideHelp,
          hideTopBar,
          alwaysMaximized,
          hideMenuBar,
          openApps: openApps.map((type) => ({ id: type, value: { type } })),
        };
    } else {
      const { [getDeviceId()]: deviceConfig, ...newConfig } = currentUser.systemConfig;

      config = newConfig;

      formMethods.setValue('onDevice', '');
    }

    updateUser({
      userId: currentUser.objectId,
      user: {
        systemConfig: config,
      },
    })
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((error) => console.log(error));
  };

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCONFIGSYSTEM } }] }));
  }, [id]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  return (
    <Dialog
      className="ConfigSystemDialog configDialog"
      id={id}
      index={index}
      title={`System config: ${currentUser.username}`}
      onClick={onClick}
      done={onDone}
      buttons={[
        <>
          {onDevice === 'this' && currentUser.systemConfig[getDeviceId()] && (
            <Button
              stopPropagation
              key="removeConfig"
              type="button"
              onClick={() => onSubmit({ removeDeviceConfig: true })}
            >
              Remove
            </Button>
          )}
        </>,
        <Button
          stopPropagation
          key="submit"
          onClick={() => formMethods.handleSubmit(onSubmit)()}
          type="submit"
        >
          Update
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div>
            <p>{`Changes made here will only affect your user (${currentUser.username}) and only when you are logged in.`}</p>
          </div>
          <div>
            <span>Do you want to change settings for when you login on any device or a specific device? The device specific settings will override any global settings</span>
            <Select
              key="onDevice"
              name="onDevice"
              defaultValue=""
            >
              <option value="">Any device (default)</option>
              <option value="this">This device</option>
            </Select>
          </div>
          <div>
            <span>Select apps to auto-open when you log in (you can choose how they are expanded and placed in Settings for each app):</span>
            <Select
              multiple
              key={`openApps-${onDevice}`}
              defaultValue={(systemConfig.openApps || ['']).map((app) => (app.value ? app.value.type : ''))}
              name="openApps"
            >
              <option value="">No app</option>
              <option value={WindowTypes.CHAT}>Chat</option>
              <option value={WindowTypes.WALLET}>Wallet</option>
              <option value={WindowTypes.WORLDMAP}>Map</option>
              <option value={WindowTypes.DOCFILE}>Files</option>
              <option value={WindowTypes.NEWS}>News</option>
            </Select>
          </div>
          <div>
            <span>Automatically maximize windows?</span>
            <Input
              key={`alwaysMaximized-${onDevice}`}
              type="checkbox"
              name="alwaysMaximized"
              checked={systemConfig.alwaysMaximized}
            />
          </div>
          <div>
            <span>Minimize main menu?</span>
            <Input
              key={`hideMenuBar-${onDevice}`}
              type="checkbox"
              name="hideMenuBar"
              checked={systemConfig.hideMenuBar}
            />
          </div>
          <div>
            <span>Hide top row in windows? (Windows will be auto-maximized)?</span>
            <Input
              key={`hideTopBar-${onDevice}`}
              type="checkbox"
              name="hideTopBar"
              checked={systemConfig.hideTopBar}
            />
          </div>
          <div>
            <span>Hide help buttons?</span>
            <Input
              key={`hideHelp-${onDevice}`}
              type="checkbox"
              name="hideHelp"
              checked={systemConfig.hideHelp}
            />
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(ConfigSystemDialog);

ConfigSystemDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
