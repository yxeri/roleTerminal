import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../common/dialogs/Dialog/Dialog';
import Input from '../../common/sub-components/Input/Input';
import Button from '../../common/sub-components/Button/Button';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import Textarea from '../../common/sub-components/Textarea/Textarea';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import IdentityPicker from '../../common/lists/IdentityPicker/IdentityPicker';
import ImageUpload from '../../common/sub-components/ImageUpload/ImageUpload';
import { updateUser } from '../../../socket/actions/users';
import { getCurrentUser } from '../../../redux/selectors/users';
import Select from '../../common/sub-components/selects/Select/Select';

const SettingsNewsDialog = ({ id, index }) => {
  const currentUser = useSelector(getCurrentUser);
  const formMethods = useForm();
  const [error, setError] = useState();
  const { systemConfig = { [WindowTypes.NEWS]: {} } } = currentUser;

  const onSubmit = ({
    expand,
    hideTopBar,
  }) => {
    updateUser({
      userId: currentUser.objectId,
      user: {
        systemConfig: {
          ...systemConfig,
          [WindowTypes.NEWS]: {
            ...systemConfig[WindowTypes.NEWS],
            expand,
            hideTopBar,
          },
        },
      },
    })
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((updateError) => console.log(updateError));
  };

  return (
    <Dialog
      id={id}
      index={index}
      className="SettingsNewsDialog configDialog"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGSETTINGSNEWS } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      error={error}
      title="Settings: News App"
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
          <div>
            <span>Hide top row? (Window will be auto-maximized. You can close and change settings for the window under File)?</span>
            <Input type="checkbox" name="hideTopBar" checked={systemConfig.hideTopBar} />
          </div>
          <div>
            <span>Automatically expand and place window?</span>
            <Select
              defaultValue={systemConfig[WindowTypes.NEWS].expand}
              name="expand"
            >
              <option value="">No</option>
              <option value="maximize">Maximize</option>
              <option value="left">Left half</option>
              <option value="right">Right half</option>
            </Select>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(SettingsNewsDialog);

SettingsNewsDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
