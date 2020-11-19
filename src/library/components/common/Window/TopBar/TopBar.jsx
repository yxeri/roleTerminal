import React from 'react';
import {
  func,
  string,
} from 'prop-types';

import './TopBar.scss';

export default function TopBar({
  onDoubleClick,
  title,
  done,
}) {
  return (
    <div
      onDoubleClick={onDoubleClick}
      className="topBar"
    >
      <span>{title}</span>
      <div className="buttons">
        <button type="button" onClick={onDoubleClick}>[]</button>
        <button type="button" onClick={done}>X</button>
      </div>
    </div>
  );
}

TopBar.propTypes = {
  done: func.isRequired,
  title: string.isRequired,
  onDoubleClick: func.isRequired,
}
