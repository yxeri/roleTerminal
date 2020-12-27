import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { batch } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../../../common/dialogs/Dialog/Dialog';
import Input from '../../../../common/sub-components/Input';
import Button from '../../../../common/sub-components/Button/Button';
import store from '../../../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../../../redux/actions/windowOrder';
import Textarea from '../../../../common/sub-components/Textarea';
import { sendNewsMessage } from '../../../../../socket/actions/messages';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import IdentityPicker from '../../../../common/lists/IdentityPicker/IdentityPicker';

const CreateNewsDialog = ({ id, index }) => {
  const methods = useForm();
  const [error, setError] = useState();

  const onSubmit = ({
    title,
    text,
    image,
  }) => {
    sendNewsMessage({ title, text, image })
      .then(({ message }) => {
        batch(() => {
          store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.NEWS, value: { type: WindowTypes.NEWS, messageId: message.objectId } }] }));
          store.dispatch(removeWindow({ id }));
        });
      })
      .catch((createError) => console.log(createError));
  };

  return (
    <Dialog
      index={index}
      classNames={['CreateNewsDialog']}
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATENEWS } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      error={error}
      title="New news article"
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <div className="identity">
            <span>You are:</span>
            <IdentityPicker />
          </div>
          <Input
            required
            maxLength={150}
            name="title"
            placeholder="Title"
          />
          <Textarea
            required
            maxLength={550}
            name="text"
            placeholder="Text"
          />
          <div className="buttons">
            <Button
              type="submit"
              onClick={() => {}}
            >
              Create
            </Button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(CreateNewsDialog);

CreateNewsDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
