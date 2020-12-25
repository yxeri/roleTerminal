import React, { useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import {
  arrayOf,
  func,
  string,
  node,
  number,
} from 'prop-types';

import './Window.scss';
import TopBar from './TopBar/TopBar';

const Window = ({
  onClick,
  children,
  order,
  menu,
  done,
  type = 'window',
  title = 'app',
  classNames = [],
}) => {
  const defaultSize = type === 'window' ? { width: 640, height: 460 } : { width: 440, height: 360 };
  const [size, setSize] = useState(defaultSize);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const rndClasses = ['rnd'];
  const windowClasses = ['Window'].concat(classNames);

  const onDoubleClick = useCallback(() => {
    if (size.width === '100%' && size.height === '100%') {
      setSize(defaultSize);
    } else {
      setCoordinates({ x: 0, y: 0 });
      setSize({ width: '100%', height: '100%' });
    }
  }, [size, coordinates]);

  return (
    <Rnd
      position={coordinates}
      className={`${rndClasses.join(' ')}`}
      style={{ zIndex: order }}
      size={size}
      maxHeight="100%"
      maxWidth="100%"
      bounds="parent"
      dragHandleClassName="TopBarHandle"
      enableResizing={{
        top: false,
        topRight: false,
        topLeft: false,
        right: true,
        bottom: true,
        left: true,
        bottomRight: true,
        bottomLeft: true,
      }}
      resizeHandleStyles={{
        left: { left: '0', width: '5px' },
        right: { right: '0', width: '5px' },
        bottom: { bottom: '0', height: '5px' },
        bottomLeft: {
          bottom: '0',
          left: '0',
          width: '5px',
          height: '5px',
        },
        bottomRight: {
          bottom: '0',
          right: '0',
          width: '5px',
          height: '5px',
        },
      }}
      onDragStart={onClick}
      onDragStop={(event, { node: element, x: newX, y: newY }) => {
        if (coordinates && newX === coordinates.x && newY === coordinates.y) {
          return;
        }

        if (newX === 0 && newY === 0 && size.height !== '100%') { // Upper left
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: 0, y: 0 });
        } else if (newX === 0 && (newY + element.offsetHeight + 35) >= window.innerHeight && size.height !== '100%') { // Lower left
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: 0, y: ((window.innerHeight - 36) / 2) });
        } else if (newY === 0 && newX + element.offsetWidth >= window.innerWidth && size.height !== '100%') { // Upper right
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: window.innerWidth / 2, y: 0 });
        } else if (newX + element.offsetWidth >= window.innerWidth && newY + element.offsetHeight + 35 >= window.innerHeight && size.height !== '100%') { // Lower right
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: window.innerWidth / 2, y: ((window.innerHeight - 36) / 2) });
        } else if (newX === 0 && newY > 0) { // Left
          setSize({ width: '50%', height: '100%' });
          setCoordinates({ x: 0, y: 0 });
        } else if (newX + element.offsetWidth >= window.innerWidth && newY > 0) { // Right
          setSize({ width: '50%', height: '100%' });
          setCoordinates({ x: window.innerWidth / 2, y: 0 });
        } else {
          setCoordinates({ x: newX, y: newY });
        }
      }}
      onResizeStart={onClick}
      onResizeStop={(event, direction, element) => {
        if (element.offsetWidth !== size.width || element.offsetHeight !== size.height) {
          setSize({ width: element.offsetWidth, height: element.offsetHeight });
        }
      }}
    >
      <div
        role="complementary"
        onClick={onClick}
        className={`${windowClasses.join(' ')}`}
      >
        <TopBar
          done={done}
          title={title}
          onDoubleClick={onDoubleClick}
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
          <div className="content">
            {children}
          </div>
        </div>
      </div>
    </Rnd>
  );
};

export default React.memo(Window);

Window.propTypes = {
  order: number,
  onClick: func.isRequired,
  children: node.isRequired,
  menu: node,
  title: string,
  classNames: arrayOf(string),
  done: func,
  type: string,
};

Window.defaultProps = {
  done: undefined,
  classNames: [],
  title: 'app',
  menu: undefined,
  order: undefined,
  type: 'window',
};
