import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { createDocFile } from '../../../../socket/actions/docFiles';
import store from '../../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../../redux/actions/windowOrder';
import Dialog from '../../../common/dialogs/Dialog/Dialog';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import Input from '../../../common/sub-components/Input/Input';
import IdentityPicker from '../../../common/lists/IdentityPicker/IdentityPicker';
import Textarea from '../../../common/sub-components/Textarea/Textarea';
import Button from '../../../common/sub-components/Button/Button';

import './CreateDocFileDialog.scss';
import ImageUpload from '../../../common/sub-components/ImageUpload/ImageUpload';

const CreateDocFileDialog = ({ id, index }) => {
  const formMethods = useForm();

  const onSubmit = async ({
    title,
    text,
    code,
    isPublic,
    image,
  }) => {
    const params = {
      images: image ? [image] : undefined,
      docFile: {
        title,
        text,
        code,
        isPublic,
      },
    };

    createDocFile(params)
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((error) => console.log(error));
  };

  return (
    <Dialog
      id={id}
      index={index}
      className="CreateDocFileDialog"
      title="New document"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATEDOCFILE } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      buttons={[
        <Button
          stopPropagation
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
          <IdentityPicker label={<span>You are:</span>} />
          <Input
            label="Do you want it to be available to the public? (A user with the right code can always access the document)"
            type="checkbox"
            name="isPublic"
          />
          <Input
            required
            label="Title"
            maxLength={40}
            name="title"
            placeholder="Title"
          />
          <Input
            label="Code"
            minLength={3}
            maxLength={10}
            name="code"
            placeholder="Code"
          />
          <Textarea
            required
            maxLength={3500}
            name="text"
            placeholder="Text"
          />
          <ImageUpload />
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(CreateDocFileDialog);

CreateDocFileDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
