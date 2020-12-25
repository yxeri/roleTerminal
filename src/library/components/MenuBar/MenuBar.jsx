import React from 'react';
import { useSelector } from 'react-redux';
import Clock from './sub-components/Clock';
import MainList from './lists/MainList';
import { isOnline } from '../../redux/selectors/online';

import './MenuBar.scss';
import OpenApps from './lists/OpenApps';
import IdentityPicker from '../common/lists/IdentityPicker/IdentityPicker';
import { getCurrentAccessLevel } from '../../redux/selectors/users';
import { AccessLevels } from '../../AccessCentral';

const MenuBar = () => {
  const online = useSelector(isOnline);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const content = [];
  const classes = [];

  if (!online) {
    classes.push('warning');
  }

  return (
    <div
      className={`${classes.join(' ')}`}
      id="MenuBar"
    >
      <MainList />
      <OpenApps />
      {content}
      <div className="rightAligned">
        {accessLevel >= AccessLevels.STANDARD && (
          <IdentityPicker useIcon />
        )}
        <Clock />
      </div>
    </div>
  );
};

export default React.memo(MenuBar);
