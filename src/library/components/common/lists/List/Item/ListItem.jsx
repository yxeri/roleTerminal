import React, { useCallback, useLayoutEffect, useRef } from 'react';
import {
  bool,
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
  className = '',
}, ref) => {
  const itemRef = useRef(null);

  useLayoutEffect(() => {
    if (scrollTo && itemRef.current) {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTimeout(() => itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 300);
    }
  }, [scrollTo]);

  const onClickCall = useCallback((event) => {
    if (onClick) {
      onClick(event);
    }

    if (event.target.parentElement.tagName === 'UL') {
      event.target.parentElement.click();
    }

    if (stopPropagation) {
      event.stopPropagation();
    }
  }, []);

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
      className={`ListItem ${onClick ? 'clickable' : ''} ${className}`}
      onClick={onClickCall}
    >
      {children}
    </li>
  );
});

export default React.memo(ListItem);

ListItem.propTypes = {
  children: node,
  onClick: func,
  className: string,
  stopPropagation: bool,
  elementId: string,
  scrollTo: bool,
};

ListItem.defaultProps = {
  onClick: undefined,
  className: '',
  stopPropagation: false,
  elementId: undefined,
  children: undefined,
  scrollTo: false,
};
