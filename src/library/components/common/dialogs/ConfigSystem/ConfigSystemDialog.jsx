import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { number, string } from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';

import Dialog from '../Dialog/Dialog';
import store from '../../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import { getCurrentUser } from '../../../../redux/selectors/users';
import Input from '../../sub-components/Input/Input';
import { updateUser } from '../../../../socket/actions/users';
import Button from '../../sub-components/Button/Button';
import Select from '../../sub-components/Select/Select';

import './ConfigSystemDialog.scss';

const ConfigSystemDialog = ({ id, index }) => {
  const formMethods = useForm();
  const currentUser = useSelector(getCurrentUser);
  const { systemConfig = {} } = currentUser;

  const onSubmit = ({
    hideHelp,
    hideTopBar,
    alwaysMaximized,
    hideMenuBar,
    openApps,
  }) => {
    updateUser({
      userId: currentUser.objectId,
      user: {
        systemConfig: {
          ...systemConfig,
          hideHelp,
          hideTopBar,
          alwaysMaximized,
          hideMenuBar,
          openApps,
        },
      },
    })
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((error) => console.log(error));
  };

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCONFIGSYSTEM } }] }));
  }, [id]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onSubmitCall = useCallback(() => formMethods.handleSubmit(onSubmit)(), []);

  return (
    <Dialog
      className="ConfigSystemDialog configDialog"
      id={id}
      index={index}
      title={`System config: ${currentUser.username}`}
      onClick={onClick}
      done={onDone}
      buttons={[
        <Button
          stopPropagation
          key="submit"
          onClick={onSubmitCall}
          type="submit"
        >
          Update
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div>
            <span>Select up to 2 apps that will auto-open when you log in (you can choose how they are expanded and placed in Settings for each app):</span>
            <Select
              multiple
              defaultValue={systemConfig.openApps}
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
            <span>Hide help buttons?</span>
            <Input type="checkbox" name="hideHelp" checked={systemConfig.hideHelp} />
          </div>
          <div>
            <span>Hide top row in windows? (Windows will be auto-maximized)?</span>
            <Input type="checkbox" name="hideTopBar" checked={systemConfig.hideTopBar} />
          </div>
          <div>
            <span>Automatically maximize windows?</span>
            <Input type="checkbox" name="alwaysMaximized" checked={systemConfig.alwaysMaximized} />
          </div>
          <div>
            <span>Minimize main menu?</span>
            <Input type="checkbox" name="hideMenuBar" checked={systemConfig.hideMenuBar} />
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
