import React from 'react';
import { node } from 'prop-types';
import List from '../sub-components/List/List';
import ListItem from '../sub-components/List/ListItem/ListItem';

const FileMenu = ({ children }) => {
  return (
    <List
      dropdown
      classNames={['FileMenu']}
      title="File"
    >
      {children}
      <ListItem
        key="quit"
        onClick={() => { console.log('quit'); }}
      >
        Quit
      </ListItem>
    </List>
  );
};

export default FileMenu;

FileMenu.propTypes = {
  children: node.isRequired,
};
