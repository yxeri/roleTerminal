import React from 'react';
import { node } from 'prop-types';
import List from './List/List';
import ListItem from './List/Item/ListItem';

const FileMenu = ({ children }) => (
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

export default React.memo(FileMenu);

FileMenu.propTypes = {
  children: node.isRequired,
};
