import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Clock from './sub-components/Clock';
import MainList from './lists/MainList';
import { isOnline } from '../../redux/selectors/online';

import './MenuBar.scss';

const MenuBar = () => {
  const [dialog, setDialog] = useState();
  const online = useSelector(isOnline);
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
      <MainList onDialog={setDialog} />
      {content}
      <Clock />
      {dialog}
    </div>
  );
};

export default MenuBar;
