import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { batch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../common/dialogs/Dialog/Dialog';
import Input from '../../common/sub-components/Input/Input';
import Button from '../../common/sub-components/Button/Button';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import Textarea from '../../common/sub-components/Textarea';
import { sendNewsMessage } from '../../../socket/actions/messages';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import IdentityPicker from '../../common/lists/IdentityPicker/IdentityPicker';
import ImageUpload from '../../common/sub-components/ImageUpload/ImageUpload';
import { getWalletById } from '../../../redux/selectors/wallets';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';
import { getNewsCost } from '../../../redux/selectors/config';

const CreateNewsDialog = ({ id, index }) => {
  const newsCost = useSelector(getNewsCost);
  const identityId = useSelector(getCurrentIdentityId);
  const wallet = useSelector((state) => getWalletById(state, { id: identityId }));
  const formMethods = useForm();
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
      id={id}
      index={index}
      className="CreateNewsDialog"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATENEWS } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      error={error}
      title="New article"
      buttons={[
        <Button
          key="submit"
          type="submit"
          onClick={() => formMethods.handleSubmit(onSubmit)()}
        >
          Create
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div className="identity">
            <span>You are:</span>
            <IdentityPicker />
          </div>
          <div>
            <p>{`The article fee is: ${newsCost}`}</p>
            <p>{`You have ${wallet.amount} in your wallet`}</p>
          </div>
          <Input
            required
            maxLength={200}
            name="title"
            placeholder="Title"
          />
          <ImageUpload />
          <Textarea
            required
            maxLength={800}
            name="text"
            placeholder="Text"
          />
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
