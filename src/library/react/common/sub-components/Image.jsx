import React from 'react';

const Image = ({ image, altText = '' } = {}) => {
  return (
    <div className="imageBox">
      <img
        src={image}
        alt={altText}
      />
    </div>
  );
};

export default Image;
