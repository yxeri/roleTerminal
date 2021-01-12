import React from 'react';
import { func, node, string } from 'prop-types';
import { useSelector } from 'react-redux';

import List from './List/List';
import ListItem from './List/Item/ListItem';
import store from '../../../redux/store';
import { getCurrentUser } from '../../../redux/selectors/users';
import { removeWindow } from '../../../redux/actions/windowOrder';
import { ReactComponent as Menu } from '../../../icons/menu.svg';

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
              Preferences
            </ListItem>
          )}
          <ListItem
            stopPropagation
            key="quit"
            onClick={() => store.dispatch(removeWindow({ id }))}
          >
            Quit
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
