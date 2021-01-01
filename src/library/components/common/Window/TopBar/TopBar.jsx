import React, { useCallback } from 'react';
import {
  func,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';

import { ReactComponent as Maximize } from '../../../../icons/maximize.svg';
import { ReactComponent as Close } from '../../../../icons/close.svg';
import { ReactComponent as Settings } from '../../../../icons/settings.svg';
import { ReactComponent as Help } from '../../../../icons/help.svg';
import Button from '../../sub-components/Button/Button';
import store from '../../../../redux/store';
import { changeMode, changeTarget } from '../../../../redux/actions/mode';
import { Modes } from '../../../../redux/reducers/mode';
import { getCurrentAccessLevel, getSystemConfig } from '../../../../redux/selectors/users';
import { AccessLevels } from '../../../../AccessCentral';
import { getMode } from '../../../../redux/selectors/mode';

import './TopBar.scss';

const TopBar = ({
  onDoubleClick,
  title,
  done,
  id,
  onSettings,
}) => {
  const accessLevel = useSelector(getCurrentAccessLevel);
  const systemConfig = useSelector(getSystemConfig);
  const mode = useSelector(getMode);

  const onHelp = useCallback(() => {
    if (mode.mode === Modes.HELP && mode.target !== id) {
      store.dispatch(changeTarget({ target: id }));
    } else {
      store.dispatch(changeMode({ mode: Modes.HELP, target: id }));
    }
  }, [mode, id]);

  return (
    <div
      onDoubleClick={onDoubleClick}
      className="TopBar"
    >
      <div className="TopBarHandle">
        <span className="title">{title}</span>
      </div>
      <div className="buttons">
        {!systemConfig.hideHelp && (
          <Button
            stopPropagation
            key="help"
            className={`help ${mode.mode === Modes.HELP && mode.target === id ? 'active' : ''}`}
            type="button"
            onClick={onHelp}
          >
            <Help />
          </Button>
        )}
        {accessLevel >= AccessLevels.STANDARD && onSettings && (
          <Button key="settings" className="settings" stopPropagation type="button" onClick={onSettings}><Settings /></Button>
        )}
        {!systemConfig.alwaysMaximized && (
          <Button type="button" onClick={onDoubleClick}><Maximize /></Button>
        )}
        <Button className="close" stopPropagation type="button" onClick={done}><Close /></Button>
      </div>
    </div>
  );
};

export default React.memo(TopBar);

TopBar.propTypes = {
  done: func.isRequired,
  title: string.isRequired,
  onDoubleClick: func.isRequired,
  id: string.isRequired,
  onSettings: func,
};

TopBar.defaultProps = {
  onSettings: undefined,
};
