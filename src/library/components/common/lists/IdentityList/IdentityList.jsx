import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { bool } from 'prop-types';

import List from '../List/List';
import { getOthersIdentities } from '../../../../redux/selectors/users';
import IdentityItem from './Item/IdentityItem';
import ListItem from '../List/Item/ListItem';
import Input from '../../sub-components/Input/Input';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import Button from '../../sub-components/Button/Button';
import { ReactComponent as Close } from '../../../../icons/close.svg';

import './IdentityList.scss';

const IdentityList = ({
  partialSearch = true,
}) => {
  const formMethods = useForm();
  const partialName = useWatch({ control: formMethods.control, name: 'partialName' });
  const identities = useSelector(getOthersIdentities);

  const userItems = (() => {
    if (partialName && partialName.length > 1) {
      return identities
        .filter(({ name }) => {
          if (partialSearch) {
            return name.toLowerCase().includes(partialName.toLowerCase());
          }

          return name.toLowerCase() === partialName.toLowerCase();
        })
        .map(({ objectId: identityId }) => <IdentityItem key={identityId} identityId={identityId} />);
    }

    return identities.map(({ objectId: identityId }) => <IdentityItem key={identityId} identityId={identityId} />);
  })();

  const onSubmit = () => {
    if (userItems.length === 0) {
      formMethods.reset();
    } else if (userItems.length === 1) {
      store.dispatch(changeWindowOrder({
        windows: [{
          id: `${WindowTypes.DIALOGIDENTITY}-${userItems[0].key}`,
          value: {
            identityId: userItems[0].key,
            type: WindowTypes.DIALOGIDENTITY,
          },
        }],
      }));

      formMethods.reset();
    }
  };

  const onReset = useCallback(() => formMethods.reset(), []);

  return (
    <List
      dropdown
      checkWidth
      className="IdentityList"
      title="Users"
    >
      <ListItem className="userSearch">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Input name="partialName" placeholder="Find user" />
            <Button stopPropagation onClick={onReset}><Close /></Button>
          </form>
        </FormProvider>
      </ListItem>
      {
        partialName && userItems.length === 0
          ? ([<ListItem key="noMatch">No match found</ListItem>])
          : (userItems)
      }
    </List>
  );
};

export default React.memo(IdentityList);

IdentityList.propTypes = {
  partialSearch: bool,
};

IdentityList.defaultProps = {
  partialSearch: true,
};
