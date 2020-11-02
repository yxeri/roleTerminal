import React from 'react';
import { string } from 'prop-types';

export default function Image({ image, altText = '' } = {}) {
  return (
    <div className="imageBox">
      <img
        src={image}
        alt={altText}
      />
    </div>
  );
}

Image.propTypes = {
  image: string.isRequired,
  altText: string,
};

Image.defaultProps = {
  altText: '',
};
