import React from 'react';
import { useSelector } from 'react-redux';
import { bool, node } from 'prop-types';

import { getCurrentUserIdentitiesNames } from '../../../../redux/selectors/users';
import { getCurrentIdentityId } from '../../../../redux/selectors/userId';
import List from '../List/List';
import ListItem from '../List/Item/ListItem';
import store from '../../../../redux/store';
import { changeAliasId } from '../../../../redux/actions/aliasId';
import { ReactComponent as User } from '../../../../icons/user.svg';
import { getAliasById } from '../../../../redux/selectors/aliases';

import './IdentityPicker.scss';

const IdentityPicker = ({ useIcon = false, hideOnSingle = true, label }) => {
  const identities = useSelector(getCurrentUserIdentitiesNames);
  const identityId = useSelector(getCurrentIdentityId);
  const currentIdentity = identities.find((identity) => identity.objectId === identityId);

  const items = (() => {
    const filtered = useIcon ? identities : identities.filter((identity) => identity.objectId !== identityId);

    return filtered.map((identity) => (
      <ListItem
        className={identity.objectId === identityId ? 'selected' : ''}
        key={identity.objectId}
        onClick={() => store.dispatch(changeAliasId({ aliasId: getAliasById(store.getState(), { id: identity.objectId }) ? identity.objectId : undefined }))}
      >
        {identity.name}
      </ListItem>
    ));
  })();

  const title = currentIdentity ? currentIdentity.name : '---';

  return (
    <div className={`IdentityPicker ${hideOnSingle && identities.length === 1 ? 'hide' : ''}`}>
      {label}
      <List
        dropdown
        title={useIcon
          ? <User />
          : (
            <>
              <User />
              <span>{title}</span>
            </>
          )}
      >
        {items}
      </List>
    </div>
  );
};

export default React.memo(IdentityPicker);

IdentityPicker.propTypes = {
  useIcon: bool,
  hideOnSingle: bool,
  label: node,
};

IdentityPicker.defaultProps = {
  useIcon: undefined,
  hideOnSingle: true,
  label: undefined,
};
