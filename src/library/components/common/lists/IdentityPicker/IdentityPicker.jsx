import React from 'react';
import { useSelector } from 'react-redux';
import { bool } from 'prop-types';

import { getCurrentUserIdentities } from '../../../../redux/selectors/users';
import { getCurrentIdentityId } from '../../../../redux/selectors/userId';
import List from '../List/List';
import ListItem from '../List/Item/ListItem';
import store from '../../../../redux/store';
import { changeAliasId } from '../../../../redux/actions/aliasId';

import { ReactComponent as Users } from '../../../../icons/users.svg';

const IdentityPicker = ({ useIcon = false }) => {
  const identities = useSelector(getCurrentUserIdentities);
  const identityId = useSelector(getCurrentIdentityId);
  const currentIdentity = identities.find((identity) => identity.objectId === identityId);

  const itemMapper = () => {
    const filtered = useIcon ? identities : identities.filter((identity) => identity.objectId !== identityId);

    return filtered.map((identity) => (
      <ListItem
        key={identity.objectId}
        onClick={() => store.dispatch(changeAliasId({ aliasId: identity.aliasName ? identity.objectId : undefined }))}
      >
        {identity.aliasName || identity.username}
      </ListItem>
    ));
  };

  const title = currentIdentity ? currentIdentity.aliasName || currentIdentity.username : '---';

  return (
    <List
      dropdown
      classNames={['IdentityPicker']}
      title={useIcon ? <Users /> : title}
    >
      {itemMapper()}
    </List>
  );
};

export default React.memo(IdentityPicker);

IdentityPicker.propTypes = {
  useIcon: bool,
};

IdentityPicker.defaultProps = {
  useIcon: undefined,
};
