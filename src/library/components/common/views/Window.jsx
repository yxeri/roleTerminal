import React, { useState } from 'react';
import { Rnd } from 'react-rnd';

import './Window.scss';
import { useSelector } from 'react-redux';
import { getRoom } from '../../../redux/selectors/rooms';

const Window = ({
  onClick,
  children,
  order,
  title = 'app',
  classNames = [],
  done = () => {},
}) => {
  const room = useSelector((state) => getRoom)
  const [size, setSize] = useState({ width: 320, height: 220 });
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(order);
  const [full, setFull] = useState(false);

  const { width, height } = size;
  const { x, y } = coordinates;

  return (
    <Rnd
      className={`rnd ${full ? 'full' : ''}`}
      style={{ zIndex: order }}
      default={{
        x,
        y,
        width,
        height,
      }}
      minWidth={320}
      minHeight={210}
      resizeGrid={[20, 20]}
      dragGrid={[20, 20]}
      bounds="parent"
      cancel="windowBox"
      dragHandleClassName="topBar"
      enableResizing={{
        top: false,
        right: true,
        bottom: true,
        left: false,
        topRight: false,
        bottomRight: true,
        bottomLeft: false,
        topLeft: false,
      }}
      onDragStart={onClick}
      onResize={onClick}
      onResizeStop={() => setFull(false)}
    >
      <div
        onClick={onClick}
        className={`window ${classNames.join(' ')}`}
      >
        <div
          onDoubleClick={() => setFull(!full)}
          className="topBar"
        >
          <span>{title}</span>
          <div className="buttons">
            <button type="button" onClick={() => setFull(!full)}>[]</button>
            <button type="button" onClick={done}>X</button>
          </div>
        </div>
        <div className="windowBox">
          {children}
        </div>
      </div>
    </Rnd>
  );
};

export default Window;
