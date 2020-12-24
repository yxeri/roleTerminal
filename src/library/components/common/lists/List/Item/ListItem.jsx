import React from 'react';
import {
  arrayOf, bool,
  func,
  node,
  string,
} from 'prop-types';

const ListItem = ({
  children,
  onClick,
  stopPropagation = false,
  classNames = [],
}) => (
  <li
    className={['ListItem', `${onClick ? 'clickable' : ''}`].concat(classNames).join(' ')}
    onClick={(event) => {
      if (onClick) {
        console.log('list item');
        onClick(event);
      }

      if (event.target.parentElement.tagName === 'UL') {
        event.target.parentElement.click();
      }

      if (stopPropagation) {
        event.stopPropagation();
      }
    }}
  >
    {children}
  </li>
);

export default React.memo(ListItem);

ListItem.propTypes = {
  children: node.isRequired,
  onClick: func,
  classNames: arrayOf(string),
  stopPropagation: bool,
};

ListItem.defaultProps = {
  onClick: undefined,
  classNames: [],
  stopPropagation: false,
};
