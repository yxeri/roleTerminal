import React, { useLayoutEffect, useRef } from 'react';
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
  scrollTo,
  stopPropagation = false,
  classNames = [],
}, ref) => {
  const itemRef = useRef(null);

  useLayoutEffect(() => {
    if (scrollTo && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
    }
  }, [scrollTo]);

  return (
    <li
      ref={(element) => {
        if (ref) {
          // eslint-disable-next-line no-param-reassign
          ref.current = element;
        }

        itemRef.current = element;
      }}
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
  );
});

export default React.memo(ListItem);

ListItem.propTypes = {
  children: node,
  onClick: func,
  classNames: arrayOf(string),
  stopPropagation: bool,
  elementId: string,
  scrollTo: bool,
};

ListItem.defaultProps = {
  onClick: undefined,
  classNames: [],
  stopPropagation: false,
  elementId: undefined,
  children: undefined,
  scrollTo: false,
};
