import React, { useEffect, useRef, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { bool, node, string } from 'prop-types';

import Image from '../Image/Image';
import Button from '../Button/Button';
import { ReactComponent as ImageIcon } from '../../../../icons/image.svg';

import './ImageUpload.scss';

const ImageUpload = ({ useIcon = false, presetImage, label }) => {
  const { register, setValue } = useFormContext();
  const previewRef = useRef(null);
  const inputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(presetImage);
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
    if (!watchImage) {
      setPreviewImage();
    } else if (previewRef.current) {
      previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        ref={previewRef}
        onRemove={() => setPreviewImage()}
        className={`previewImage ${!previewImage ? 'hide' : ''}`}
        image={previewImage ? previewImage.source : ''}
        altText="Image preview"
      />
      <Button
        type="button"
        onClick={() => { inputRef.current.click(); }}
      >
        <ImageIcon />
        {!useIcon && (<span>{previewImage ? 'Change image' : label || 'Upload image'}</span>)}
      </Button>
    </div>
  );
};

export default React.memo(ImageUpload);

ImageUpload.propTypes = {
  useIcon: bool,
  presetImage: string,
  label: node,
};

ImageUpload.defaultProps = {
  useIcon: false,
  presetImage: undefined,
  label: undefined,
};
