import React from 'react';
import { func, node } from 'prop-types';

export default function ListItem({
  children,
  onClick = () => {},
}) {
  return (
    <li onClick={onClick}>
      {children}
    </li>
  );
}

ListItem.propTypes = {
  children: node.isRequired,
  onClick: func,
};

ListItem.defaultProps = {
  onClick: () => {},
};
