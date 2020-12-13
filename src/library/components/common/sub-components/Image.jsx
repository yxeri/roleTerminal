import React from 'react';
import { arrayOf, string } from 'prop-types';

const Image = React.forwardRef(({
  image,
  classNames = [],
  altText = '',
} = {}, ref) => (
  <div className={`${['Image'].concat(classNames).join(' ')}`}>
    <img
      ref={ref}
      src={image}
      alt={altText}
    />
  </div>
));

export default Image;

Image.propTypes = {
  image: string.isRequired,
  altText: string,
  classNames: arrayOf(string),
};

Image.defaultProps = {
  altText: '',
  classNames: [],
};
