import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import {
  func,
  string,
  node, number,
} from 'prop-types';
import { useSelector } from 'react-redux';

import TopBar from './TopBar/TopBar';
import { getAlwaysMaximized, getHideTopBar } from '../../../redux/selectors/users';

import './Window.scss';

const Window = ({
  onClick,
  children,
  menu,
  done,
  index,
  id,
  onSettings,
  type = 'window',
  title = 'app',
  className = '',
}) => {
  const rndRef = useRef();
  const hideTopBar = useSelector(getHideTopBar);
  const alwaysMaximized = useSelector(getAlwaysMaximized);
  const defaultSize = type === 'window' ? { width: 380, height: 340 } : { width: 380, height: 340 };
  const [size, setSize] = useState(defaultSize);
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const resizing = {
    right: true,
    bottom: true,
    left: true,
    bottomRight: true,
    bottomLeft: true,
  };
  const style = { zIndex: index };

  const maximize = useCallback(() => {
    setCoordinates({ x: 0, y: 0 });
    setSize({ width: '100%', height: '100%' });
  }, []);

  const onDoubleClick = useCallback(() => {
    if (size.width === '100%' && size.height === '100%') {
      setSize(defaultSize);
    } else {
      maximize();
    }
  }, [size, coordinates]);

  useEffect(() => {
    if (hideTopBar || alwaysMaximized) {
      maximize();
    }
  }, [hideTopBar, alwaysMaximized]);

  useEffect(() => {
    const onOrientationChange = (event) => {
      const windowStyle = rndRef.current.resizableElement.current.style;
      const rndBounds = rndRef.current.resizableElement.current.getBoundingClientRect();
      const mainBounds = rndRef.current.resizableElement.current.parentElement.getBoundingClientRect();
      const orientation = event.target.screen.orientation ? event.target.screen.orientation.angle : event.target.orientation;

      if (windowStyle.width === '100%' && windowStyle.height === '100%') {
        return;
      }

      if (orientation === 0) {
        if (rndBounds.left + 10 > mainBounds.width / 2) {
          if (mainBounds.height > mainBounds.width) {
            setCoordinates({ x: 0, y: mainBounds.height / 2 });
          } else {
            setCoordinates({ x: 0, y: (mainBounds.width - 36) / 2 });
          }
        } else {
          setCoordinates({ y: 0, x: 0 });
        }

        setSize({ width: '100%', height: '50%' });
      } else {
        if (rndBounds.top + 10 > mainBounds.height / 2) {
          if (mainBounds.width > mainBounds.height) {
            setCoordinates({ y: 0, x: mainBounds.width / 2 });
          } else {
            setCoordinates({ y: 0, x: (mainBounds.height + 36) / 2 });
          }
        } else {
          setCoordinates({ y: 0, x: 0 });
        }

        setSize({ width: '50%', height: '100%' });
      }
    };

    window.addEventListener('orientationchange', onOrientationChange);

    return () => window.removeEventListener('orientationchange', onOrientationChange);
  }, []);

  return (
    <Rnd
      ref={rndRef}
      style={style}
      onClick={onClick}
      position={coordinates}
      className="rnd"
      size={size}
      minWidth={260}
      minHeight={220}
      maxWidth="100%"
      maxHeight="calc(100%)"
      bounds="#MainWindow"
      dragHandleClassName="TopBarHandle"
      enableResizing={resizing}
      resizeHandleStyles={{
        left: { left: 0, width: '10px' },
        right: { right: 0, width: '10px' },
        bottom: { bottom: 0, height: '5px' },
        bottomLeft: {
          bottom: 0,
          left: 0,
          width: '20px',
          height: '15px',
        },
        bottomRight: {
          bottom: 0,
          right: 0,
          width: '20px',
          height: '15px',
        },
      }}
      onDragStart={onClick}
      onDragStop={(event, { node: element, x: newX, y: newY }) => {
        if (coordinates && newX === coordinates.x && newY === coordinates.y) {
          return;
        }

        const right = newX + element.offsetWidth >= window.innerWidth;
        const left = newX === 0;
        const up = newY === 0;
        const down = newY + element.offsetHeight + 36 >= window.innerHeight;
        const smallHeight = window.innerHeight < 450;
        const smallWidth = window.innerWidth < 450;
        const windowBounds = rndRef.current.resizableElement.current.parentElement.getBoundingClientRect();

        if (!smallHeight && !smallWidth && up && left && !right && !down) {
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: 0, y: 0 });
        } else if (!smallHeight && !smallWidth && up && right && !left && !down) {
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: windowBounds.width / 2, y: 0 });
        } else if (!smallHeight && !smallWidth && down && left && !right && !up) {
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: 0, y: (windowBounds.height / 2) });
        } else if (!smallHeight && !smallWidth && down && right && !left && !up) {
          setSize({ width: '50%', height: '50%' });
          setCoordinates({ x: windowBounds.width / 2, y: (windowBounds.height / 2) });
        } else if (!smallWidth && left && !right) { // Left
          setSize({ width: '50%', height: '100%' });
          setCoordinates({ x: 0, y: 0 });
        } else if (!smallWidth && right && !left) { // Right
          setSize({ width: '50%', height: '100%' });
          setCoordinates({ x: windowBounds.width / 2, y: 0 });
        } else if (!smallHeight && up && !down) { // Up
          setSize({ height: '50%', width: '100%' });
          setCoordinates({ y: 0, x: 0 });
        } else if (!smallHeight && down && !up) { // Down
          setSize({ height: '50%', width: '100%' });
          setCoordinates({ x: 0, y: windowBounds.height / 2 });
        } else {
          setCoordinates({ x: newX, y: newY });
        }
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
        className={`Window ${className}`}
      >
        {
          !hideTopBar
            ? (
              <TopBar
                maximized={size.width === '100%' && size.height === '100%'}
                onSettings={onSettings}
                id={id}
                done={done}
                title={title}
                onDoubleClick={onDoubleClick}
              />
            )
            : (<div />)
        }
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
  className: string,
  done: func,
  type: string,
  index: number.isRequired,
  id: string.isRequired,
  onSettings: func,
};

Window.defaultProps = {
  done: undefined,
  className: undefined,
  title: 'app',
  menu: undefined,
  type: 'window',
  onSettings: undefined,
};
