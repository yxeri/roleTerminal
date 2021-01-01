import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { bool } from 'prop-types';

import List from '../List/List';
import { getCurrentUser, getOthersIdentities } from '../../../../redux/selectors/users';
import IdentityItem from './Item/IdentityItem';
import ListItem from '../List/Item/ListItem';
import Input from '../../sub-components/Input/Input';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import Button from '../../sub-components/Button/Button';
import { ReactComponent as Close } from '../../../../icons/close.svg';
import { getAllowPartialSearch, getOnlySeen } from '../../../../redux/selectors/config';

import './IdentityList.scss';
import { AccessLevels } from '../../../../AccessCentral';

const IdentityList = () => {
  const formMethods = useForm();
  const partialName = useWatch({ control: formMethods.control, name: 'partialName' });
  const onlySeen = useSelector(getOnlySeen);
  const currentUser = useSelector(getCurrentUser);
  const identities = useSelector(getOthersIdentities);
  const allowPartialSearch = useSelector(getAllowPartialSearch);

  const onClick = useCallback(() => {
    formMethods.reset();
  }, []);

  const userItems = (() => {
    let filtered = identities;

    if (partialName && partialName.length > 0) {
      const hasSeen = currentUser.hasSeen || [];

      filtered = filtered
        .filter((identity) => {
          if (allowPartialSearch || currentUser.accessLevel >= AccessLevels.ADMIN || hasSeen.includes(identity.objectId) || currentUser.partOfTeams.some((teamId) => identity.partOfTeams.includes(teamId))) {
            return identity.name.toLowerCase().includes(partialName.toLowerCase());
          }

          return identity.name.toLowerCase() === partialName.toLowerCase();
        });
    } else if (onlySeen && currentUser.accessLevel < AccessLevels.ADMIN) {
      const hasSeen = currentUser.hasSeen || [];

      filtered = filtered
        .filter((identity) => hasSeen.includes(identity.objectId) || currentUser.partOfTeams.some((teamId) => identity.partOfTeams.includes(teamId)));
    }

    return filtered.map(({ objectId: identityId }) => <IdentityItem key={identityId} identityId={identityId} onClick={onClick} />);
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
      <ListItem className="search">
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
