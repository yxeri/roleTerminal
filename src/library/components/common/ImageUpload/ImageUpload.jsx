import React from 'react';
import { func, string } from 'prop-types';

import Image from '../sub-components/Image';

import imageIcon from './imageIcon.png';
import Button from '../sub-components/Button/Button';

export default function ImageUpload({ previewImage, onChange } = {}) {
  const inputRef = React.createRef();

  const onChangeFunc = ({ target }) => {
    const files = target.files || [];
    const file = files[0];

    if (file) {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (reader.result) {
          onChange({
            name: file.name,
            src: reader.result.toString(),
          });
        }
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="imageUpload"
    >
      <input
        key="uploadInput"
        className="hide"
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/pjpeg"
        onChange={onChangeFunc}
      />
      <Button
        type="button"
        onClick={() => { inputRef.current.input.click(); }}
      >
        {
          previewImage
            && (
              <Image
                image={previewImage}
                altText="Image preview"
              />
            )
        }
        <Image
          image={imageIcon}
          altText="Upload image"
        />
      </Button>
    </div>
  );
}

ImageUpload.propTypes = {
  onChange: func.isRequired,
  previewImage: string,
};

ImageUpload.defaultProps = {
  previewImage: undefined,
};
