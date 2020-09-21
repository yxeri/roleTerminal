import React from 'react';

import Clock from './sub-components/Clock';

const MenuBar = () => {
  const content = [];

  return (
    <div className="menuBar">
      <div></div>
      {content}
      <Clock />
    </div>
  );
};

export default MenuBar;
