import React, { useEffect, useRef, useState } from 'react';
import {
  string,
  arrayOf,
  bool,
  node,
  shape,
} from 'prop-types';

import './List.scss';

const List = React.forwardRef(({
  children,
  title,
  scrollTo,
  alwaysExpanded = false,
  checkWidth = false,
  dropdown = false,
  classNames = [],
}, ref) => {
  const listRef = useRef(null);
  const windowRef = useRef(null);
  const [hidden, setHidden] = useState(!alwaysExpanded && typeof title !== 'undefined');
  const listClasses = [];
  const classes = ['List'].concat(classNames);

  const onClick = (event) => {
    if (dropdown && listRef.current && (!checkWidth || !windowRef.current || windowRef.current.offsetWidth < 600)) {
      if (event.target === listRef.current || !listRef.current.parentElement.contains(event.target)) {
        setHidden(true);
      }
    }
  };

  useEffect(() => {
    if (scrollTo && listRef.current) {
      if (scrollTo.direction === 'bottom' && listRef.current.lastElementChild) {
        listRef.current.lastElementChild.scrollIntoView(false);
      } else if (scrollTo.direction === 'top' && listRef.current.firstElementChild) {
        listRef.current.firstElementChild.scrollIntoView(false);
      }
    }
  });

  useEffect(() => {
    if (dropdown) {
      if (!hidden) {
        document.addEventListener('mousedown', onClick, false);
      } else {
        document.removeEventListener('mousedown', onClick, false);
      }
    }
  }, [hidden]);

  if (!hidden) {
    classes.push('expanded');
  } else {
    listClasses.push('hide');
  }

  if (dropdown) {
    listClasses.push('dropdown');
  }

  return (
    <div
      key="List"
      className={classes.join(' ')}
    >
      { title && (
        <header
          role="button"
          tabIndex={0}
          key="listHeader"
          className={`toggle ${!alwaysExpanded ? 'clickable' : ''}`}
          onClick={() => {
            if (!alwaysExpanded) {
              setHidden(!hidden);
            }
          }}
        >
          {title}
        </header>
      )}
      <ul
        ref={(element) => {
          listRef.current = element;

          if (ref) {
            ref.current = element;
          }

          if (element) {
            windowRef.current = element.closest('.Window');
          }
        }}
        key="listElem"
        className={`${listClasses.join(' ')}`}
        onClick={(event) => {
          if (dropdown) {
            onClick(event);

            event.stopPropagation();
          }
        }}
      >
        {children}
      </ul>
    </div>
  );
});

export default React.memo(List);

List.propTypes = {
  children: node,
  title: node,
  classNames: arrayOf(string),
  dropdown: bool,
  scrollTo: shape({
    direction: string,
    buffer: bool,
  }),
  checkWidth: bool,
  alwaysExpanded: bool,
};

List.defaultProps = {
  classNames: [],
  children: undefined,
  title: undefined,
  dropdown: false,
  scrollTo: undefined,
  checkWidth: false,
  alwaysExpanded: false,
};
