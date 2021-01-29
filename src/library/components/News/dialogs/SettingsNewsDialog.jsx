import React from 'react';
import { number, string } from 'prop-types';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import SettingsAppDialog from '../../common/dialogs/SettingsApp/SettingsAppDialog';

const SettingsNewsDialog = ({ id, index }) => {
  return (
    <SettingsAppDialog
      windowType={WindowTypes.NEWS}
      id={id}
      index={index}
    />
  );
};

export default React.memo(SettingsNewsDialog);

SettingsNewsDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
