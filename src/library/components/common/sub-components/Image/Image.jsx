import React, { useEffect, useRef, useState } from 'react';
import {
  arrayOf,
  func,
  number,
  string,
} from 'prop-types';

import { ReactComponent as Maximize } from '../../../../icons/maximize.svg';
import { ReactComponent as Minimize } from '../../../../icons/minimize.svg';

import './Image.scss';

const Image = React.forwardRef(({
  image,
  onRemove,
  width,
  height,
  classNames = [],
  altText = '',
  fullImage,
  fullWidth,
  fullHeight,
} = {}, ref) => {
  const containerRef = useRef(null);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (!showFull && containerRef.current) {
      containerRef.current.scrollIntoView();
    }
  }, [showFull]);

  const onClick = (event) => {
    if (fullImage) {
      setShowFull(!showFull);

      event.stopPropagation();
    }
  };

  return (
    <div
      role="complementary"
      ref={containerRef}
      className={`${['Image', showFull ? 'full' : ''].concat(classNames).join(' ')}`}
      onClick={onClick}
    >
      {onRemove && (
        <div
          className="clickable"
          role="complementary"
          onClick={(event) => {
            onRemove();

            event.stopPropagation();
          }}
        >
          X
        </div>
      )}
      {fullImage && (
        <div
          onClick={onClick}
          className="clickable"
          role="complementary"
        >
          {showFull ? <Minimize /> : <Maximize />}
        </div>
      )}
      <img
        className={fullImage ? 'clickable' : ''}
        onClick={onClick}
        width={showFull ? fullWidth : width}
        height={showFull ? fullHeight : height}
        ref={ref}
        src={showFull ? fullImage : image}
        alt={altText}
      />
    </div>
  );
});

export default Image;

Image.propTypes = {
  image: string.isRequired,
  altText: string,
  classNames: arrayOf(string),
  onRemove: func,
  width: number,
  height: number,
  fullImage: string,
  fullWidth: number,
  fullHeight: number,
};

Image.defaultProps = {
  altText: '',
  classNames: [],
  onRemove: undefined,
  width: undefined,
  height: undefined,
  fullImage: undefined,
  fullWidth: undefined,
  fullHeight: undefined,
};
