import React from 'react';
import {
  func,
  string,
} from 'prop-types';

import './TopBar.scss';

const TopBar = ({
  onDoubleClick,
  title,
  done,
}) => (
  <div
    onDoubleClick={onDoubleClick}
    className="TopBar"
  >
    <span>{title}</span>
    <div className="buttons">
      <button type="button" onClick={onDoubleClick}>[]</button>
      <button type="button" onClick={done}>X</button>
    </div>
  </div>
);

export default React.memo(TopBar);

TopBar.propTypes = {
  done: func.isRequired,
  title: string.isRequired,
  onDoubleClick: func.isRequired,
};
