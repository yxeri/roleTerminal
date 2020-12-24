import React from 'react';
import { node } from 'prop-types';
import List from './List/List';

const FileMenu = ({ children }) => (
  <List
    dropdown
    checkWidth
    classNames={['FileMenu']}
    title="File"
  >
    {children}
  </List>
);

export default React.memo(FileMenu);

FileMenu.propTypes = {
  children: node.isRequired,
};
