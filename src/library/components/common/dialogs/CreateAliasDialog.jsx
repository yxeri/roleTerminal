import React, { useCallback, useState } from 'react';
import { number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from './Dialog/Dialog';
import Button from '../sub-components/Button/Button';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import Input from '../sub-components/Input/Input';
import Select from '../sub-components/selects/Select/Select';
import Textarea from '../sub-components/Textarea/Textarea';
import { createAlias } from '../../../socket/actions/aliases';
import ImageUpload from '../sub-components/ImageUpload/ImageUpload';
import PronounsSelect from '../sub-components/selects/PronounsSelect';

const CreateAliasDialog = ({ id, index }) => {
  const formMethods = useForm();
  const [image, setImage] = useState();

  const onSubmit = async ({
    aliasName,
    pronouns,
    description,
  }) => {
    const params = {
      image,
      alias: {
        aliasName,
        pronouns,
        description: description ? description.split('\n') : undefined,
      },
    };

    createAlias(params)
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((error) => console.log(error));
  };

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATEALIAS } }] }));
  }, [id]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onSubmitCall = useCallback(() => formMethods.handleSubmit(onSubmit)(), []);

  return (
    <Dialog
      id={id}
      index={index}
      title="New alias"
      onClick={onClick}
      done={onDone}
      buttons={[
        <Button
          stopPropagation
          key="submit"
          type="submit"
          onClick={onSubmitCall}
        >
          Create
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Input
            required
            label="Alias name"
            maxLength={30}
            name="aliasName"
            placeholder="Alias name"
          />
          <PronounsSelect />
          <ImageUpload label="Upload profile image" />
          <Textarea
            label="Description"
            maxLength={300}
            name="description"
            placeholder="Description"
          />
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(CreateAliasDialog);

CreateAliasDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
