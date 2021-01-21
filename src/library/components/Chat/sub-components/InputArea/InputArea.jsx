import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { func, number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';

import ImageUpload from '../../../common/sub-components/ImageUpload/ImageUpload';
import { AccessLevels } from '../../../../AccessCentral';
import { isOnline } from '../../../../redux/selectors/online';
import { getCurrentAccessLevel } from '../../../../redux/selectors/users';
import { getAllowedImages } from '../../../../redux/selectors/config';
import Button from '../../../common/sub-components/Button/Button';
import { sendMessage } from '../../../../socket/actions/messages';
import IdentityPicker from '../../../common/lists/IdentityPicker/IdentityPicker';
import Textarea from '../../../common/sub-components/Textarea/Textarea';
import { ReactComponent as CloudOff } from '../../../../icons/cloud-off.svg';

import './InputArea.scss';

const InputArea = ({
  roomId,
  onSend,
  minAccessLevel = AccessLevels.STANDARD,
}) => {
  const [isSending, setIsSending] = useState(false);
  const formMethods = useForm();
  const buttonRef = useRef(null);
  const online = useSelector(isOnline);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const allowedImages = useSelector(getAllowedImages);

  const onChange = (event) => {
    const { value } = event.target;

    if (value.match(/.*\s@[a-z\S]+$/)) {
      console.log('match');
    }
  };

  const onSubmit = ({
    text,
    image,
  }) => {
    setIsSending(true);

    sendMessage({
      roomId,
      image,
      text,
    }).then(({ message, switchRoom }) => {
      formMethods.setValue('text', '');
      formMethods.setValue('image', undefined);

      if (switchRoom) {
        onSend({ roomId: message.roomId });
      }

      setIsSending(false);
    }).catch((error) => {
      console.log('error', error);

      setIsSending(false);
    });
  };

  return (
    <div className="InputArea">
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          {accessLevel >= minAccessLevel && (
            <div
              key="buttonBox"
              className="buttonBox"
            >
              {
                allowedImages.CHAT
                && (
                  <ImageUpload useIcon />
                )
              }
              <IdentityPicker />
            </div>
          )}
          <div className="input">
            <Textarea
              onChange={onChange}
              key="input"
              name="text"
              onKeyDown={(event) => {
                const { key, altKey } = event;

                if (altKey && key === 'Enter' && buttonRef.current) {
                  buttonRef.current.click();
                }
              }}
              placeholder={online ? 'Alt+Enter to send message' : 'Offline. Reconnecting to server...'}
            />
            <Button
              ref={buttonRef}
              disabled={!online || isSending}
              key="send"
              type="submit"
              className="sendButton"
              onClick={() => {}}
            >
              {online
                ? (
                  <span>Send</span>
                )
                : (
                  <CloudOff />
                )}
            </Button>
          </div>
        </form>
      </FormProvider>
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
