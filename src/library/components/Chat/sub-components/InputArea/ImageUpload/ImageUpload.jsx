import React, { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Image from '../../../../common/sub-components/Image';
import Button from '../../../../common/sub-components/Button/Button';

import imageIcon from './imageIcon.png';

import './ImageUpload.scss';

const ImageUpload = () => {
  const { setValue, register, watch } = useFormContext();
  const inputRef = useRef(null);
  const previewRef = useRef(null);
  const [previewImage, setPreviewImage] = useState();
  const watchImage = watch('image');

  useEffect(() => {
    if (previewImage) {
      const image = { ...previewImage };
      image.width = previewRef.current.naturalWidth;
      image.height = previewRef.current.naturalHeight;

      setValue('image', image);
    } else {
      setValue('image', undefined);
    }
  }, [previewImage]);

  useEffect(() => {
    register('image');
  }, []);

  useEffect(() => {
    if (!watchImage && previewImage) {
      setPreviewImage();
    }
  }, [watchImage]);

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
