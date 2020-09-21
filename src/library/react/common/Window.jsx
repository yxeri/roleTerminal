import { Resizable } from 'react-resizable';
import Draggable from "react-draggable";
import React, { useState } from 'react';

import 'react-resizable/css/styles.css';

const Window = ({ children, title = 'app', classNames = [] }) => {
  const [size, setSize] = useState({ width: 320, height: 200});
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });

  return (
    <Draggable
      grid={[20, 20]}
      bounds="parent"
      handle=".topBar"
      onStop={(event, { x, y }) => setCoordinates({ x, y })}
    >
      <Resizable
        draggableOpts={{grid: [20, 20]}}
        minConstraints={[320, 200]}
        height={size.height}
        width={size.width}
        onResize={(event, { size }) => setSize(size)}
      >
        <div
          className={`window ${classNames.join(' ')}`}
          style={{ width: `${size.width}px`, height: `${size.height}px` }}
        >
          <div className="topBar">{title}</div>
          {children}
        </div>
      </Resizable>
    </Draggable>
  );
};

export default Window;
