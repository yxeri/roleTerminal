import React, { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import Image from '../Image/Image';
import Button from '../Button/Button';

import { ReactComponent as ImageIcon } from '../../../../icons/image.svg';

import './ImageUpload.scss';

const ImageUpload = ({ useIcon = false }) => {
  const { register, setValue } = useFormContext();
  const inputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState();
  const watchImage = useWatch({ name: 'image' });

  useEffect(() => {
    register('image');
  }, []);

  useEffect(() => {
    if (previewImage) {
      setValue('image', previewImage);
    } else {
      setValue('image', undefined);
    }
  }, [previewImage]);

  useEffect(() => {
    console.log(watchImage);

    if (!watchImage) {
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
          const image = {
            imageName: file.name,
            source: reader.result,
          };

          setPreviewImage(image);
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
      <Image
        onRemove={() => setPreviewImage()}
        classNames={['previewImage'].concat([!previewImage ? 'hide' : ''])}
        image={previewImage ? previewImage.source : ''}
        altText="Image preview"
      />
      <Button
        type="button"
        onClick={() => { inputRef.current.click(); }}
      >
        <ImageIcon />
        {!useIcon && (<span>Upload image</span>)}
      </Button>
    </div>
  );
};

export default React.memo(ImageUpload);
