import React, { useCallback } from 'react';
import {
  bool,
  func,
  node,
  string,
} from 'prop-types';
import { useSelector } from 'react-redux';

import { ReactComponent as Help } from '../../../../icons/help.svg';
import { ReactComponent as Move } from '../../../../icons/move.svg';
import { ReactComponent as Close } from '../../../../icons/close.svg';
import { ReactComponent as Minimize } from '../../../../icons/minimize.svg';
import { ReactComponent as Maximize } from '../../../../icons/maximize.svg';
import { removeWindow } from '../../../../redux/actions/windowOrder';
import Button from '../../sub-components/Button/Button';
import store from '../../../../redux/store';
import { changeMode, changeTarget } from '../../../../redux/actions/mode';
import { Modes } from '../../../../redux/reducers/mode';
import { getSystemConfig } from '../../../../redux/selectors/users';
import { getMode } from '../../../../redux/selectors/mode';

import './TopBar.scss';

const TopBar = ({
  onDoubleClick,
  title,
  id,
  menu,
  type,
  maximized,
}) => {
  const systemConfig = useSelector(getSystemConfig);
  const mode = useSelector(getMode);

  const onHelp = useCallback(() => {
    if (mode.mode === Modes.HELP && mode.target !== id) {
      store.dispatch(changeTarget({ target: id }));
    } else {
      store.dispatch(changeMode({ mode: Modes.HELP, target: id }));
    }
  }, [mode, id]);

  const onClose = useCallback(() => {
    store.dispatch(removeWindow({ id }));
  }, []);

  return (
    <div
      className="TopBar"
    >
      <div className="menu">
        {menu}
      </div>
      <div
        onDoubleClick={onDoubleClick}
        className="dragHandle"
      >
        <div className="title">{title}</div>
      </div>
      <div className="buttons">
        {!systemConfig.alwaysMaximized && (
          <Button type="button" onClick={onDoubleClick}>
            {
              maximized
                ? <Minimize />
                : <Maximize />
            }
          </Button>
        )}
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
        {type === 'dialog' && <Button stopPropagation className="close" onClick={onClose}><Close /></Button>}
      </div>
    </div>
  );
};

export default React.memo(TopBar);

TopBar.propTypes = {
  title: node.isRequired,
  onDoubleClick: func.isRequired,
  id: string.isRequired,
  menu: node,
  type: string.isRequired,
  maximized: bool.isRequired,
};

TopBar.defaultProps = {
  menu: undefined,
};
