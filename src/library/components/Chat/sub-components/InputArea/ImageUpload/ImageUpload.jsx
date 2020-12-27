import React, { useEffect, useRef, useState } from 'react';
import { func } from 'prop-types';

import Image from '../../../../common/sub-components/Image';
import Button from '../../../../common/sub-components/Button/Button';

import imageIcon from './imageIcon.png';

import './ImageUpload.scss';

const ImageUpload = ({ onChange } = {}) => {
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const [previewImage, setPreviewImage] = useState();

  useEffect(() => {
    const image = { ...previewImage };
    image.width = previewRef.current.naturalWidth;
    image.height = previewRef.current.naturalHeight;

    onChange(image);
  }, [previewImage]);

  const onChangeFunc = ({ target }) => {
    const files = target.files || [];
    const file = files[0];

    if (file) {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        if (reader.result) {
          setPreviewImage({
            imageName: file.name,
            source: reader.result,
          });
        }
      });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="ImageUpload"
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
        onClick={() => { inputRef.current.click(); }}
      >
        <Image
          onRemove={() => setPreviewImage()}
          ref={previewRef}
          classNames={['previewImage'].concat([!previewImage ? 'hide' : ''])}
          image={previewImage ? previewImage.source : ''}
          altText="Image preview"
        />
        <Image
          image={imageIcon}
          altText="Upload image"
        />
      </Button>
    </div>
  );
};

export default React.memo(ImageUpload);

ImageUpload.propTypes = {
  onChange: func.isRequired,
};

ImageUpload.defaultProps = {
};
