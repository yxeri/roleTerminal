import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import {
  arrayOf,
  func,
  string,
  node,
  number,
} from 'prop-types';

import './Window.scss';
import { useSelector } from 'react-redux';
import { getRoom } from '../../../redux/selectors/rooms';
import TopBar from './TopBar/TopBar';

export default function Window({
  onClick,
  children,
  order,
  menu,
  title = 'app',
  classNames = [],
  done = () => {},
}) {
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
        role="complementary"
        onClick={onClick}
        className={`window ${classNames.join(' ')}`}
      >
        <TopBar
          done={done}
          title={title}
          onDoubleClick={() => setFull(!full)}
        />
        <div className="windowBox">
          {
            menu
            && (
              <div className="menu">
                {menu}
              </div>
            )
          }
          {children}
        </div>
      </div>
    </Rnd>
  );
}

Window.propTypes = {
  order: number.isRequired,
  onClick: func.isRequired,
  children: node.isRequired,
  menu: node,
  title: string,
  classNames: arrayOf(string),
  done: func,
};

Window.defaultProps = {
  done: () => {},
  classNames: [],
  title: 'app',
  menu: undefined,
};
