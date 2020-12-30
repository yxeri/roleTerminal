import React from 'react';
import {
  arrayOf, bool,
  func,
  node,
  string,
} from 'prop-types';

import './ListItem.scss';

const ListItem = React.forwardRef(({
  children,
  onClick,
  elementId,
  stopPropagation = false,
  classNames = [],
}, ref) => (
  <li
    ref={ref}
    id={elementId}
    className={['ListItem', `${onClick ? 'clickable' : ''}`].concat(classNames).join(' ')}
    onClick={(event) => {
      if (onClick) {
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
));

export default React.memo(ListItem);

ListItem.propTypes = {
  children: node,
  onClick: func,
  classNames: arrayOf(string),
  stopPropagation: bool,
  elementId: string,
};

ListItem.defaultProps = {
  onClick: undefined,
  classNames: [],
  stopPropagation: false,
  elementId: undefined,
  children: undefined,
};
