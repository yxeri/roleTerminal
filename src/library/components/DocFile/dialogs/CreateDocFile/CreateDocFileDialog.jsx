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
import Textarea from '../../../common/sub-components/Textarea';
import Button from '../../../common/sub-components/Button/Button';

import './CreateDocFileDialog.scss';

const CreateDocFileDialog = ({ id, index }) => {
  const formMethods = useForm();
  const [image, setImage] = useState();

  const onSubmit = async ({
    title,
    text,
    code,
    isPublic,
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
      index={index}
      classNames={['CreateDocFileDialog']}
      title="New document"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATEDOCFILE } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div className="identity">
            <span>You are:</span>
            <IdentityPicker />
          </div>
          <div className="public">
            <Input
              type="checkbox"
              name="isPublic"
            />
            <span>Do you want it to be available to the public? (A user with the right code can always access the document)</span>
          </div>
          <Input
            required
            maxLength={40}
            name="title"
            placeholder="Title"
          />
          <Input
            name="code"
            placeholder="Code"
          />
          <Textarea
            required
            maxLength={3500}
            name="text"
            placeholder="Text"
          />
          <div className="buttons">
            <Button
              stopPropagation
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

export default React.memo(CreateDocFileDialog);

CreateDocFileDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
