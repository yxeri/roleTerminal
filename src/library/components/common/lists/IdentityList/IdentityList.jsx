import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';
import { bool } from 'prop-types';

import List from '../List/List';
import {
  getCurrentAccessLevel,
  getCurrentHasSeen,
  getCurrentPartOfTeams,
  getOtherIdentities,
} from '../../../../redux/selectors/users';
import IdentityItem from './Item/IdentityItem';
import ListItem from '../List/Item/ListItem';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import { getAllowPartialSearch, getOnlySeen } from '../../../../redux/selectors/config';
import { AccessLevels } from '../../../../AccessCentral';
import SearchItem from '../List/Search/SearchItem';
import { ReactComponent as Users } from '../../../../icons/users.svg';

import './IdentityList.scss';

const IdentityList = ({
  alwaysExpanded,
  hideTitle = false,
  dropdown = true,
}) => {
  const formMethods = useForm();
  const partialName = useWatch({ control: formMethods.control, name: 'search' });
  const onlySeen = useSelector(getOnlySeen);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const hasSeen = useSelector(getCurrentHasSeen);
  const partOfTeams = useSelector(getCurrentPartOfTeams);
  const identities = useSelector(getOtherIdentities);
  const allowPartialSearch = useSelector(getAllowPartialSearch);

  const onClick = useCallback(() => {
    formMethods.reset();
  }, []);

  const userItems = (() => {
    let filtered = identities;

    if (partialName && partialName.length > 0) {
      filtered = filtered
        .filter((identity) => {
          if (allowPartialSearch || accessLevel >= AccessLevels.ADMIN || hasSeen.includes(identity.objectId) || partOfTeams.some((teamId) => identity.partOfTeams.includes(teamId))) {
            return identity.name.toLowerCase().includes(partialName.toLowerCase());
          }

          return identity.name.toLowerCase() === partialName.toLowerCase();
        });
    } else if (onlySeen && accessLevel < AccessLevels.ADMIN) {
      filtered = filtered
        .filter((identity) => hasSeen.includes(identity.objectId) || partOfTeams.some((teamId) => identity.partOfTeams.includes(teamId)));
    }

    return filtered.map(({ objectId: identityId }) => <IdentityItem key={identityId} identityId={identityId} onClick={onClick} />);
  })();

  const onSubmit = () => {
    if (userItems.length === 0) {
      formMethods.reset();
    } else if (userItems.length === 1) {
      store.dispatch(changeWindowOrder({
        windows: [{
          id: `${WindowTypes.DIALOGPROFILE}-${userItems[0].key}`,
          value: {
            identityId: userItems[0].key,
            type: WindowTypes.DIALOGPROFILE,
          },
        }],
      }));

      formMethods.reset();
    }
  };

  return (
    <List
      alwaysExpanded={alwaysExpanded}
      dropdown={dropdown}
      checkWidth={dropdown}
      className="IdentityList"
      title={!hideTitle ? <Users /> : undefined}
      wideTitle="Users"
    >
      <SearchItem onSubmit={onSubmit} formMethods={formMethods} placeholder="Search by name" />
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
  dropdown: bool,
  alwaysExpanded: bool,
  hideTitle: bool,
};

IdentityList.defaultProps = {
  dropdown: true,
  alwaysExpanded: undefined,
  hideTitle: false,
};
