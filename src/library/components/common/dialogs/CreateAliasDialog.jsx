import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from './Dialog/Dialog';
import Button from '../sub-components/Button/Button';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import Input from '../sub-components/Input/Input';
import Select from '../sub-components/Select';
import Textarea from '../sub-components/Textarea';
import { createAlias } from '../../../socket/actions/aliases';

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
        description,
      },
    };

    createAlias(params)
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((error) => console.log(error));
  };

  return (
    <Dialog
      index={index}
      title="New alias"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATEALIAS } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Input
            required
            name="aliasName"
            placeholder="Alias name"
          />
          <Select
            multiple
            required
            name="pronouns"
          >
            <option value="">---Choose pronouns---</option>
            <option value="they">They/Them</option>
            <option value="she">She/Her</option>
            <option value="he">He/Him</option>
            <option value="it">It</option>
          </Select>
          <Textarea
            name="description"
            placeholder="Description"
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

export default React.memo(CreateAliasDialog);

CreateAliasDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
