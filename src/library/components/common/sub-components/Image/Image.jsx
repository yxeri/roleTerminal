import React, { useEffect, useRef, useState } from 'react';
import {
  arrayOf, bool,
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
  scrollTo = false,
  classNames = [],
  altText = '',
  fullImage,
  fullWidth,
  fullHeight,
} = {}, ref) => {
  const containerRef = useRef(null);
  const [showFull, setShowFull] = useState(false);

  useEffect(() => {
    if (scrollTo && !showFull && containerRef.current) {
      containerRef.current.scrollIntoView({ block: 'nearest' });
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
          className="remove clickable"
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
          className="zoom clickable"
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
  scrollTo: bool,
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
  scrollTo: false,
};
