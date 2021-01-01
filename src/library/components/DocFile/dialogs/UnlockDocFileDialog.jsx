import React, { useState } from 'react';
import { number, string } from 'prop-types';
import { batch, useSelector } from 'react-redux';
import { useForm, FormProvider } from 'react-hook-form';

import Dialog from '../../common/dialogs/Dialog/Dialog';
import Input from '../../common/sub-components/Input/Input';
import Button from '../../common/sub-components/Button/Button';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import IdentityPicker from '../../common/lists/IdentityPicker/IdentityPicker';

import { ReactComponent as Unlock } from '../../../icons/unlock.svg';
import { getDocFileById } from '../../../redux/selectors/docFiles';
import { unlockDocFile } from '../../../socket/actions/docFiles';

const UnlockDocFileDialog = ({ docFileId, id, index }) => {
  const [error, setError] = useState();
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));
  const formMethods = useForm();

  const onSubmit = ({
    code,
  } = {}) => {
    unlockDocFile({ docFileId, code })
      .then(() => {
        batch(() => {
          store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DOCFILE, value: { type: WindowTypes.DOCFILE, docFileId } }] }));
          store.dispatch(removeWindow({ id }));
        });
      })
      .catch((unlockError) => {
        const newError = {
          ...unlockError,
        };

        console.log(unlockError);

        if (unlockError.type === 'not allowed') {
          newError.message = 'Incorrect code';
        }

        setError(newError);
      });
  };

  return (
    <Dialog
      id={id}
      error={error}
      index={index}
      className="UnlockDocFileDialog"
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGUNLOCKROOM, docFileId } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
      title={`Unlock file ${docFile.title}`}
      buttons={[
        <Button
          stopPropagation
          key="submit"
          type="submit"
          onClick={() => formMethods.handleSubmit(onSubmit)()}
        >
          <Unlock />
          <span>Unlock</span>
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div className="identity">
            <span>You are: </span>
            <IdentityPicker />
          </div>
          <div>
            <p>The file is locked.</p>
            <p>Enter the code to continue:</p>
          </div>
          <Input
            required
            name="code"
            type="text"
            placeholder="Code"
          />
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(UnlockDocFileDialog);

UnlockDocFileDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
  docFileId: string.isRequired,
};
