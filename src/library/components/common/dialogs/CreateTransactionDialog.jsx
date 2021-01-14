import React, { useCallback } from 'react';
import { number, string } from 'prop-types';
import { useForm, FormProvider } from 'react-hook-form';
import { useSelector } from 'react-redux';

import Dialog from './Dialog/Dialog';
import Button from '../sub-components/Button/Button';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import Input from '../sub-components/Input/Input';
import Select from '../sub-components/selects/Select/Select';
import { createTransaction } from '../../../socket/actions/transactions';
import { getWalletIdsByCurrentUser } from '../../../redux/selectors/wallets';
import { getIdentitiesOrTeamsByIds, getIdentityOrTeamById } from '../../../redux/selectors/users';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';

const CreateTransactionDialog = ({
  id,
  toWalletId,
  amount,
  index,
}) => {
  const formMethods = useForm();
  const identityId = useSelector(getCurrentIdentityId);
  const walletIds = useSelector(getWalletIdsByCurrentUser);
  const identities = useSelector((state) => getIdentitiesOrTeamsByIds(state, { ids: walletIds }));
  const toIdentity = useSelector((state) => getIdentityOrTeamById(state, { id: toWalletId }));
  const walletOptions = [];

  const onSubmit = async ({
    note,
    fromWalletId,
    amount: chosenAmount,
  }) => {
    const transaction = {
      note,
      fromWalletId,
      toWalletId,
      amount: chosenAmount,
    };

    createTransaction({ transaction })
      .then(() => store.dispatch(removeWindow({ id })))
      .catch((error) => console.log(error));
  };

  identities.forEach((identity) => {
    walletOptions.push((
      <option
        key={identity.objectId}
        value={identity.objectId}
      >
        {identity.teamName || identity.aliasName || identity.username}
      </option>
    ));
  });

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGCREATETRANSACTION, toWalletId } }] }));
  }, [id, toWalletId]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onSubmitCall = useCallback(() => formMethods.handleSubmit(onSubmit)(), []);

  return (
    <Dialog
      id={id}
      index={index}
      title={`Transfer to ${toIdentity.teamName || toIdentity.aliasName || toIdentity.username}`}
      onClick={onClick}
      done={onDone}
      buttons={[
        <Button
          stopPropagation
          key="submit"
          type="submit"
          onClick={onSubmitCall}
        >
          Transfer
        </Button>,
      ]}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <p>{`You are making a transfer to ${toIdentity.teamName || toIdentity.aliasName || toIdentity.username}`}</p>
          <div>
            <span>From your wallet: </span>
            <Select
              required
              defaultValue={identityId}
              name="fromWalletId"
            >
              <option value="">---Choose wallet---</option>
              <>{walletOptions}</>
            </Select>
          </div>
          <Input
            required
            defaultValue={amount}
            name="amount"
            placeholder="Amount"
          />
          <Input
            maxLength={50}
            name="note"
            placeholder="Note"
          />
        </form>
      </FormProvider>
    </Dialog>
  );
};

export default React.memo(CreateTransactionDialog);

CreateTransactionDialog.propTypes = {
  id: string.isRequired,
  toWalletId: string.isRequired,
  index: number.isRequired,
  amount: number,
};

CreateTransactionDialog.defaultProps = {
  amount: undefined,
};
