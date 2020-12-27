import React, { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { func, number, string } from 'prop-types';
import { useForm } from 'react-hook-form';

import ImageUpload from './ImageUpload/ImageUpload';
import { AccessLevels } from '../../../../AccessCentral';
import { isOnline } from '../../../../redux/selectors/online';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';
import { getAllowedImages, getGpsTracking } from '../../../../redux/selectors/config';
import Button from '../../../common/sub-components/Button/Button';
import { sendMessage } from '../../../../socket/actions/messages';
import IdentityPicker from '../../../common/lists/IdentityPicker/IdentityPicker';

import { ReactComponent as Pin } from '../../../../icons/pin.svg';
import { ReactComponent as Tag } from '../../../../icons/tag.svg';
import { ReactComponent as File } from '../../../../icons/file-plus.svg';

import './InputArea.scss';

const InputArea = ({
  roomId,
  onSend,
  minAccessLevel = AccessLevels.STANDARD,
}) => {
  const { register, handleSubmit, reset } = useForm();
  const inputRef = useRef(null);
  const buttonRef = useRef(null);
  const [image, setImage] = useState();
  const online = useSelector(isOnline);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const allowedImages = useSelector(getAllowedImages);
  const gpsTracking = useSelector(getGpsTracking);
  const textareaClasses = [];

  const resize = () => {
    if (inputRef.current) {
      const textarea = inputRef.current;

      if (!textarea.style.height || (textarea.scrollHeight.toString() !== textarea.style.height.split('px')[0])) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        inputRef.current.scrollIntoView();
      }
    }
  };

  const onSubmit = ({
    text,
  }) => {
    sendMessage({
      roomId,
      image,
      text,
    }).then(({ message, switchRoom }) => {
      if (image) {
        setImage(undefined);
      }

      reset();
      resize();

      if (switchRoom) {
        onSend({ roomId: message.roomId });
      }
    }).catch((error) => {
      console.log('error', error);
    });
  };

  const onSetImage = useCallback((newImage) => setImage(newImage), []);

  return (
    <div className="InputArea">
      <form onSubmit={handleSubmit(onSubmit)}>
        {accessLevel >= minAccessLevel && (
          <div
            key="buttonBox"
            className="buttonBox"
          >
            {
              allowedImages.CHAT
              && (
                <ImageUpload
                  onChange={onSetImage}
                />
              )
            }
            <Button onClick={() => {}}><Tag /></Button>
            <Button onClick={() => {}}><File /></Button>
            {
              gpsTracking
              && (
                <Button onClick={() => {}}><Pin /></Button>
              )
            }
            <IdentityPicker />
          </div>
        )}
        <div className="input">
          <textarea
            maxLength={600}
            name="text"
            key="input"
            rows={1}
            ref={(element) => {
              register(element);

              inputRef.current = element;
            }}
            onKeyDown={(event) => {
              const { key, altKey } = event;

              if (altKey && key === 'Enter' && buttonRef.current) {
                buttonRef.current.click();
              }
            }}
            placeholder={online ? 'Alt+Enter to send message' : 'Offline. Reconnecting to server...'}
            className={textareaClasses.join(' ')}
            onChange={(event) => resize(event.target)}
          />
          <Button
            ref={buttonRef}
            disabled={!online}
            key="send"
            type="submit"
            classNames={['sendButton']}
            onClick={() => {}}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(InputArea);

InputArea.propTypes = {
  minAccessLevel: number,
  roomId: string.isRequired,
  onSend: func.isRequired,
};

InputArea.defaultProps = {
  minAccessLevel: AccessLevels.STANDARD,
};
