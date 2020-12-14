import React, { useEffect, useRef, useState } from 'react';
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
  const inputRef = useRef(null);
  const [text, setText] = useState('');
  const [image, setImage] = useState();
  const online = useSelector(isOnline);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const allowedImages = useSelector(getAllowedImages);
  const textareaClasses = [];

  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current;

      if (!textarea.style.height || (textarea.scrollHeight.toString() !== textarea.style.height.split('px')[0])) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }
  }, [text]);

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

  return (
    <div className="InputArea">
      {accessLevel >= minAccessLevel && (
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
        </div>
      )}
      <div className="input">
        <textarea
          key="input"
          rows={1}
          ref={inputRef}
          onKeyDown={(event) => {
            const { key, altKey } = event;

            if (altKey && key === 'Enter') {
              submit();
            }
          }}
          value={text}
          placeholder={online ? 'Alt+Enter to send message' : 'Offline. Reconnecting to server...'}
          className={textareaClasses.join(' ')}
          onChange={(event) => setText(event.target.value)}
        />
        <Button
          disabled={!online}
          key="send"
          type="submit"
          classNames={['sendButton']}
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
