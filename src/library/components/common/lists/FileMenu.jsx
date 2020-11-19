import React from 'react';
import { arrayOf, string, shape } from 'prop-types';
import List from '../sub-components/List/List';

export default function FileMenu({ items }) {
  const allItems = items;

  allItems.push({
    key: 'quit',
    value: 'Quit',
    onClick: () => { console.log('quit'); },
  });

  return (
    <List
      dropdown
      classNames={['fileMenu']}
      title="File"
      items={allItems}
    />
  );
}

FileMenu.propTypes = {
  items: arrayOf(shape({
    key: string,
    value: string,
  })),
};

FileMenu.defaultProps = {
  items: undefined,
};
