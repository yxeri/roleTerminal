import React, { useState } from 'react';
import {
  string,
  arrayOf,
  bool, node,
} from 'prop-types';

import './List.scss';

export default function List({
  children,
  title,
  dropdown = false,
  classNames = [],
}) {
  const [hidden, setHidden] = useState(typeof title !== 'undefined');
  const content = [];
  const listClasses = [];
  const classes = classNames;

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

  classes.push('list');

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
      key="list"
      className={classes.join(' ')}
    >
      {content}
    </div>
  );
}

List.propTypes = {
  children: node,
  title: string,
  classNames: arrayOf(string),
  dropdown: bool,
};

List.defaultProps = {
  classNames: [],
  children: undefined,
  title: undefined,
  dropdown: false,
};
