import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { func, number } from 'prop-types';

import ImageUpload from '../../../common/ImageUpload/ImageUpload';

import { AccessLevels } from '../../../../AccessCentral';
import { isOnline } from '../../../../redux/selectors/online';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';
import { getAllowedImages } from '../../../../redux/selectors/config';

import './InputArea.scss';
import Button from '../../../common/sub-components/Button/Button';

const InputArea = ({
  onSubmit,
  minAccessLevel = AccessLevels.STANDARD,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState();
  const online = useSelector(isOnline);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const allowedImages = useSelector(getAllowedImages);
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
          allowedImages.CHAT
            && (
              <ImageUpload
                onChange={setImage}
              />
            )
        }
      </div>,
    );
  }

  return (
    <div className="InputArea">
      {content}
      <div className="input">
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
        <Button
          disabled={!online}
          key="send"
          type="submit"
          className="sendButton"
          onClick={() => submit()}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default React.memo(InputArea);

InputArea.propTypes = {
  onSubmit: func.isRequired,
  minAccessLevel: number,
};

InputArea.defaultProps = {
  minAccessLevel: AccessLevels.STANDARD,
};
