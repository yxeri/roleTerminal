import React from 'react';
import { node } from 'prop-types';
import List from '../sub-components/List/List';
import ListItem from '../sub-components/List/ListItem/ListItem';

export default function FileMenu({ children }) {
  return (
    <List
      dropdown
      classNames={['fileMenu']}
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
}

FileMenu.propTypes = {
  children: node.isRequired,
};
