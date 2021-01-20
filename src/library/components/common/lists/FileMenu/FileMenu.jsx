import React from 'react';
import { func, node, string } from 'prop-types';
import { useSelector } from 'react-redux';

import List from '../List/List';
import ListItem from '../List/Item/ListItem';
import store from '../../../../redux/store';
import { getCurrentUser } from '../../../../redux/selectors/users';
import { removeWindow } from '../../../../redux/actions/windowOrder';
import { ReactComponent as Menu } from '../../../../icons/menu.svg';
import { ReactComponent as Settings } from '../../../../icons/settings.svg';
import { ReactComponent as MinClose } from '../../../../icons/minimize-close.svg';

import './FileMenu.scss';

const FileMenu = ({ id, children, onSettings }) => {
  const { systemConfig = {} } = useSelector(getCurrentUser);

  return (
    <List
      dropdown
      checkWidth
      className="FileMenu"
      title={<Menu />}
    >
      {children}
      {!systemConfig.hideTopRow && (
        <>
          {onSettings && (
            <ListItem
              stopPropagation
              key="settings"
              onClick={onSettings}
            >
              <Settings />
              <span>Preferences</span>
            </ListItem>
          )}
          <ListItem
            stopPropagation
            key="quit"
            onClick={() => store.dispatch(removeWindow({ id }))}
          >
            <MinClose />
            <span>Minimize window</span>
          </ListItem>
        </>
      )}
    </List>
  );
};

export default React.memo(FileMenu);

FileMenu.propTypes = {
  children: node,
  id: string.isRequired,
  onSettings: func,
};

FileMenu.defaultProps = {
  children: undefined,
  onSettings: undefined,
};
