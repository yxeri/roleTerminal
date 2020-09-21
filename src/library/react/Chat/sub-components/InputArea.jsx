import React, { useState, useEffect } from 'react';

import ImageUpload from '../../common/ImageUpload/ImageUpload';

import keyHandler from '../../../KeyHandler';
import accessCentral from '../../../AccessCentral';

const InputArea = ({ triggerCallback, minAccessLevel = accessCentral.AccessLevels.STANDARD, allowImages = true }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState();
  const content = [];
  const textareaClasses = [];

  /**
   * Call callback with the input text and reset state
   */
  function submit() {
    triggerCallback({
      image,
      text: text.split('\n'),
    });
    setText('');
    setImage(undefined);
  }

  useEffect(() => {
    return () => {
      keyHandler.removeKey(13);
    };
  });

  if (isFocused) {
    textareaClasses.push('focused');
  }

  if (accessCentral.getAccessLevel() >= minAccessLevel) {
    content.push(
      <div
        key="buttonBox"
        className="buttonBox"
      >
        {
          allowImages
            ? (
              <ImageUpload
                previewImage={image}
                onChange={setImage}
              />
            )
            : <></>
        }
      </div>,
    );
  }

  keyHandler.addKey(13, () => { submit(); });

  return (
    <div className="inputArea">
      {content}
      <textarea
        key="textarea"
        className={textareaClasses.join(' ')}
        onChange={(event) => { setText(event.target.value); }}
        onFocus={() => { setIsFocused(true); }}
        onBlur={() => { setIsFocused(false); }}
      />
      <button
        key="send"
        type="submit"
        className="sendButton"
        onClick={() => { submit(); }}
      >
        Send
      </button>
    </div>
  );
};

export default InputArea;
