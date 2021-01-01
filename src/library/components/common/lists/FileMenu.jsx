import React from 'react';
import { node, string } from 'prop-types';
import { useSelector } from 'react-redux';

import List from './List/List';
import ListItem from './List/Item/ListItem';
import store from '../../../redux/store';
import { getCurrentUser } from '../../../redux/selectors/users';
import { removeWindow } from '../../../redux/actions/windowOrder';

const FileMenu = ({ id, children }) => {
  const { systemConfig = {} } = useSelector(getCurrentUser);

  return (
    <List
      dropdown
      checkWidth
      className="FileMenu"
      title="File"
    >
      {children}
      {!systemConfig.hideTopRow && (
        <>
          <ListItem
            stopPropagation
            key="settings"
            onClick={() => {}}
          >
            Settings
          </ListItem>
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
  children: node.isRequired,
  id: string.isRequired,
};
