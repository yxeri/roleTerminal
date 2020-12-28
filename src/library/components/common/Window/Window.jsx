import React, { useCallback, useState } from 'react';
import { Rnd } from 'react-rnd';
import {
  arrayOf,
  func,
  string,
  node, number,
} from 'prop-types';

import './Window.scss';
import TopBar from './TopBar/TopBar';

const Window = ({
  onClick,
  children,
  menu,
  done,
  index,
  type = 'window',
  title = 'app',
  classNames = [],
}) => {
  const defaultSize = type === 'window' ? { width: 640, height: 480 } : { width: 640, height: 480 };
  const [size, setSize] = useState(defaultSize);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
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
      style={{ zIndex: index }}
      onClick={onClick}
      position={coordinates}
      className="rnd"
      size={size}
      minWidth={300}
      minHeight={200}
      maxHeight="100%"
      maxWidth="100%"
      bounds="parent"
      dragHandleClassName="TopBarHandle"
      enableResizing={{
        top: true,
        topRight: true,
        topLeft: true,
        right: true,
        bottom: true,
        left: true,
        bottomRight: true,
        bottomLeft: true,
      }}
      resizeHandleStyles={{
        top: { top: '0', width: '5px' },
        left: { left: '0', width: '5px' },
        right: { right: '0', width: '5px' },
        bottom: { bottom: '0', height: '5px' },
        bottomLeft: {
          bottom: '0',
          left: '0',
          width: '10px',
          height: '10px',
        },
        bottomRight: {
          bottom: '0',
          right: '0',
          width: '10px',
          height: '10px',
        },
        topRight: {
          right: '0',
          top: '0',
          width: '10px',
          height: '10px',
        },
        topLeft: {
          left: '0',
          top: '0',
          width: '10px',
          height: '10px',
        },
      }}
      onDragStart={onClick}
      onDragStop={(event, { node: element, x: newX, y: newY }) => {
        if (coordinates && newX === coordinates.x && newY === coordinates.y) {
          return;
        }

        // if (newX === 0 && newY === 0 && size.height !== '100%') { // Upper left
        //   setSize({ width: '50%', height: '50%' });
        //   setCoordinates({ x: 0, y: 0 });
        // } else if (newX === 0 && (newY + element.offsetHeight + 35) >= window.innerHeight && size.height !== '100%') { // Lower left
        //   setSize({ width: '50%', height: '50%' });
        //   setCoordinates({ x: 0, y: ((window.innerHeight - 36) / 2) });
        // } else if (newY === 0 && newX + element.offsetWidth >= window.innerWidth && size.height !== '100%') { // Upper right
        //   setSize({ width: '50%', height: '50%' });
        //   setCoordinates({ x: window.innerWidth / 2, y: 0 });
        // } else if (newX + element.offsetWidth >= window.innerWidth && newY + element.offsetHeight + 35 >= window.innerHeight && size.height !== '100%') { // Lower right
        //   setSize({ width: '50%', height: '50%' });
        //   setCoordinates({ x: window.innerWidth / 2, y: ((window.innerHeight - 36) / 2) });
        // }

        if (newX === 0 && size.width !== '100%') { // Left
          setSize({ width: '50%', height: '100%' });
          setCoordinates({ x: 0, y: 0 });
        } else if (newX + element.offsetWidth >= window.innerWidth && size.width !== '100%') { // Right
          setSize({ width: '50%', height: '100%' });
          setCoordinates({ x: window.innerWidth / 2, y: 0 });
        } else {
          setCoordinates({ x: newX, y: newY });
        }
        // else if (newY === 0 && size.height !== '100%') { // Up
        //   setSize({ height: '50%', width: '100%' });
        //   setCoordinates({ y: 0, x: 0 });
        // } else if (newY + element.offsetHeight + 35 >= window.innerHeight && size.height !== '100%') { // Down
        //   setSize({ height: '50%', width: '100%' });
        //   setCoordinates({ x: 0, y: window.innerHeight / 2 });
        // }
      }}
      onResizeStart={onClick}
      onResizeStop={(event, direction, element, _, position) => {
        if (element.offsetWidth !== size.width || element.offsetHeight !== size.height) {
          setSize({ width: element.offsetWidth, height: element.offsetHeight });
          setCoordinates(position);
        }
      }}
    >
      <div
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
  onClick: func.isRequired,
  children: node.isRequired,
  menu: node,
  title: string,
  classNames: arrayOf(string),
  done: func,
  type: string,
  index: number.isRequired,
};

Window.defaultProps = {
  done: undefined,
  classNames: [],
  title: 'app',
  menu: undefined,
  type: 'window',
};
