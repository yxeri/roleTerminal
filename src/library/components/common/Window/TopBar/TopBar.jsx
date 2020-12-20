import React from 'react';
import {
  func,
  string,
} from 'prop-types';

import { ReactComponent as Maximize } from '../../../../icons/maximize.svg';
import { ReactComponent as Close } from '../../../../icons/close.svg';

import './TopBar.scss';
import Button from '../../sub-components/Button/Button';

const TopBar = ({
  onDoubleClick,
  title,
  done,
}) => (
  <div
    onDoubleClick={onDoubleClick}
    className="TopBar"
  >
    <span className="title">{title}</span>
    <div className="buttons">
      <Button type="button" onClick={onDoubleClick}><Maximize /></Button>
      <Button stopPropagation type="button" onClick={done}><Close /></Button>
    </div>
  </div>
);

export default React.memo(TopBar);

TopBar.propTypes = {
  done: func.isRequired,
  title: string.isRequired,
  onDoubleClick: func.isRequired,
};
