import React from 'react';
import {
  arrayOf,
  func,
  node,
  string,
} from 'prop-types';

const ListItem = ({
  children,
  classNames = [],
  onClick = () => {},
}) => (
  <li
    className={['ListItem'].concat(classNames).join(' ')}
    onClick={onClick}
  >
    {children}
  </li>
);

export default ListItem;

ListItem.propTypes = {
  children: node.isRequired,
  onClick: func,
  classNames: arrayOf(string),
};

ListItem.defaultProps = {
  onClick: () => {},
  classNames: [],
};
