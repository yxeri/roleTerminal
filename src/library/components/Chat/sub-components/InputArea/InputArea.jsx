import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { func, number, bool } from 'prop-types';

import ImageUpload from '../../../common/ImageUpload/ImageUpload';

import { addKey, removeKey } from '../../../../KeyHandler';
import { AccessLevels } from '../../../../AccessCentral';
import { isOnline } from '../../../../redux/selectors/online';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';

export default function InputArea({
  onSubmit,
  minAccessLevel = AccessLevels.STANDARD,
  allowImages = true,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState();
  const online = useSelector(isOnline);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const content = [];
  const textareaClasses = [];

  const submit = () => {
    onSubmit({
      image,
      text: text.split('\n'),
    }).then(() => {
      setText('');
      setImage(undefined);
    }).catch((error) => {
      console.log(error);
    });
  };

  if (isFocused) {
    textareaClasses.push('focused');
  }

  if (accessLevel >= minAccessLevel) {
    content.push(
      <div
        key="buttonBox"
        className="buttonBox"
      >
        {
          allowImages
            && (
              <ImageUpload
                previewImage={image}
                onChange={setImage}
              />
            )
        }
      </div>,
    );
  }

  return (
    <div className="inputArea">
      {content}
      <textarea
        onKeyDown={(event) => {
          const { key, altKey } = event;

          if (altKey && key === 'Enter') {
            submit();
          }
        }}
        value={text}
        placeholder={online ? 'Alt+Enter to send message' : 'Offline. Reconnecting to server...'}
        key="textarea"
        className={textareaClasses.join(' ')}
        onChange={(event) => setText(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button
        disabled={!online}
        key="send"
        type="submit"
        className="sendButton"
        onClick={() => submit()}
      >
        Send
      </button>
    </div>
  );
}

InputArea.propTypes = {
  onSubmit: func.isRequired,
  minAccessLevel: number,
  allowImages: bool,
};

InputArea.defaultProps = {
  minAccessLevel: AccessLevels.STANDARD,
  allowImages: true,
};
