import React from 'react';
import { node } from 'prop-types';

export default function ListItem({
  children,
}) {
  return (
    <li>
      {children}
    </li>
  );
}

ListItem.propTypes = {
  children: node.isRequired,
};
