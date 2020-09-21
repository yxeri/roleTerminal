import React, { useState } from 'react';

const List = ({ title, items }) => {
  const [expanded, setExpanded] = useState(!title);
  const content = [];

  if (title) {
    content.push(
      <header
        key="listHeader"
        className="toggle clickable"
        onClick={() => { setExpanded(!expanded); } }
      >
        {title}
      </header>,
    );
  }

  content.push(
    <ul
      key="list"
      className={expanded ? '' : 'hide'}
    >
      {items.map((item) => <li key={item.key} onClick={item.onClick}>{item.value}</li>)}
    </ul>,
  );

  return (
    <>{content}</>
  );
};

export default List;
