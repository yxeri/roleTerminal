import React, { useState } from 'react';
import {
  element,
  string,
  arrayOf,
  bool,
  shape,
  func,
} from 'prop-types';

import './List.scss';

export default function List({
  children,
  title,
  items = [],
  classNames = [],
  large = false,
  hideOnClick = true,
}) {
  const [hidden, setHidden] = useState(typeof title !== 'undefined');
  const content = [];
  const classes = classNames;

  if (title) {
    content.push(
      <header
        role="button"
        tabIndex={0}
        key="listHeader"
        className="toggle clickable"
        onClick={() => {
          if (title) {
            setHidden(!hidden);
          }
        }}
      >
        {title}
      </header>,
    );
  }

  classes.push('list');

  if (large) {
    classes.push('largeList');
  }

  if (!hidden) {
    classes.push('expanded');
  }

  content.push(
    <ul
      key="listElem"
      className={hidden ? 'hide' : ''}
    >
      {
        children
          ? children.map((child) => {
            const modifiedChild = child;

            modifiedChild.onClick = () => {
              if (hideOnClick) {
                setHidden(true);
              }

              child.onClick();
            };

            return modifiedChild;
          })
          : <></>
      }
      {
        items.map((item) => (
          <li
            role="button"
            tabIndex={0}
            key={item.key}
            onKeyPress={() => {}}
            onClick={() => {
              if (hideOnClick) {
                setHidden(true);
              }

              item.onClick();
            }}
          >
            {item.value}
          </li>
        ))
      }
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
};

List.defaultProps = {
  classNames: [],
  children: undefined,
  title: undefined,
  items: [],
};
