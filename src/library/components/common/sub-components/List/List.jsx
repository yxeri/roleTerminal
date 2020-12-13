import React, { useEffect, useRef, useState } from 'react';
import {
  string,
  arrayOf,
  bool,
  node,
  shape,
} from 'prop-types';

import './List.scss';

const List = ({
  children,
  title,
  scrollTo,
  dropdown = false,
  classNames = [],
}) => {
  const listRef = useRef(null);
  const [hidden, setHidden] = useState(typeof title !== 'undefined');
  const content = [];
  const listClasses = [];
  const classes = ['list'].concat(classNames);

  useEffect(() => {
    if (scrollTo && listRef.current) {
      if (scrollTo.direction === 'bottom' && listRef.current.lastElementChild) {
        listRef.current.lastElementChild.scrollIntoView();
      }
    }
  });

  if (title) {
    content.push(
      <header
        role="button"
        tabIndex={0}
        key="listHeader"
        className="toggle clickable"
        onClick={() => setHidden(!hidden)}
      >
        {title}
      </header>,
    );
  }

  if (!hidden) {
    classes.push('expanded');
  } else {
    listClasses.push('hide');
  }

  if (dropdown) {
    listClasses.push('dropdown');
  }

  content.push(
    <ul
      ref={listRef}
      key="listElem"
      className={`${listClasses.join(' ')}`}
      onClick={() => {
        if (dropdown) {
          setHidden(true);
        }
      }}
    >
      {children}
    </ul>,
  );

  return (
    <div
      key="List"
      className={classes.join(' ')}
    >
      {content}
    </div>
  );
};

export default List;

List.propTypes = {
  children: node,
  title: string,
  classNames: arrayOf(string),
  dropdown: bool,
  scrollTo: shape({
    direction: string,
    buffer: bool,
  }),
};

List.defaultProps = {
  classNames: [],
  children: undefined,
  title: undefined,
  dropdown: false,
  scrollTo: undefined,
};
