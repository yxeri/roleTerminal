import React from 'react';
import { arrayOf, func, string } from 'prop-types';

const Image = React.forwardRef(({
  image,
  onRemove,
  classNames = [],
  altText = '',
} = {}, ref) => (
  <div className={`${['Image'].concat(classNames).join(' ')}`}>
    {
      onRemove && (
        <div
          role="complementary"
          onClick={(event) => {
            onRemove();

            event.stopPropagation();
          }}
        >
          X
        </div>
      )
    }
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
  onRemove: func,
};

Image.defaultProps = {
  altText: '',
  classNames: [],
  onRemove: undefined,
};
