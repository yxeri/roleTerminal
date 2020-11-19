import React, { useState } from 'react';
import {
  element,
  string,
  arrayOf,
  shape,
  func,
  bool,
} from 'prop-types';

import './List.scss';

export default function List({
  children,
  title,
  dropdown = false,
  items = [],
  classNames = [],
}) {
  const [hidden, setHidden] = useState(typeof title !== 'undefined');
  const content = [];
  const listClasses = [];
  const classes = classNames;

  const itemMapper = () => items.map((item) => (
    <li
      role="button"
      tabIndex={0}
      key={item.key}
      onKeyPress={() => {}}
      onClick={() => {
        if (dropdown) {
          setHidden(true);
        }

        item.onClick();
      }}
    >
      {item.value}
    </li>
  ));

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
      {itemMapper()}
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
  children: arrayOf(element),
  title: string,
  items: arrayOf(shape({
    key: string,
    value: string,
    onClick: func,
  })),
  classNames: arrayOf(string),
  dropdown: bool,
};

List.defaultProps = {
  classNames: [],
  children: undefined,
  title: undefined,
  items: [],
  dropdown: false,
};
