import React  from 'react';

import Image from '../sub-components/Image';

import imageIcon from './imageIcon.png';

const ImageUpload = ({ previewImage, onChange } = {}) => {
  const inputRef = React.createRef();

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
        onChange={({ target }) => {
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
        }}
      />
      <button
        type="button"
        onClick={() => { inputRef.current.input.click(); }}
      >
        {
          previewImage
            ? (
              <Image
                image={previewImage}
                altText="Image preview"
              />
            )
            : <></>
        }
        <Image
          image={imageIcon}
          altText="Upload image"
        />
      </button>
    </div>
  );
};

export default ImageUpload;
