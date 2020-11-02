import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { func, number, bool } from 'prop-types';

import ImageUpload from '../../common/ImageUpload/ImageUpload';

import keyHandler from '../../../KeyHandler';
import { AccessLevels } from '../../../AccessCentral';
import { isOnline } from '../../../redux/selectors/online';
import { getCurrentAccessLevel } from '../../../redux/selectors/users';

export default function InputArea({
  triggerCallback,
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

  useEffect(() => () => { keyHandler.removeKey(13); });

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

  keyHandler.addKey(13, () => submit());

  return (
    <div className="inputArea">
      {content}
      <textarea
        placeholder={online ? 'Alt+Enter to send message' : 'Offline. Reconnecting to server...'}
        key="textarea"
        className={textareaClasses.join(' ')}
        onChange={(event) => setText(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <button
        disabled={online}
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
  triggerCallback: func.isRequired,
  minAccessLevel: number,
  allowImages: bool,
};

InputArea.defaultProps = {
  minAccessLevel: AccessLevels.STANDARD,
  allowImages: true,
};
