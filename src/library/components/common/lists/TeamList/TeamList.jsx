import React, { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useSelector } from 'react-redux';

import List from '../List/List';
import TeamItem from './Item/TeamItem';
import ListItem from '../List/Item/ListItem';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import SearchItem from '../List/Search/SearchItem';
import { ReactComponent as Users } from '../../../../icons/users.svg';
import { getTeamIdsNames } from '../../../../redux/selectors/teams';

import './TeamList.scss';

const TeamList = () => {
  const formMethods = useForm();
  const partialName = useWatch({ control: formMethods.control, name: 'search' });
  const teams = useSelector(getTeamIdsNames);

  const onClick = useCallback(() => {
    formMethods.reset();
  }, []);

  const teamItems = (() => {
    let filtered = teams;

    if (partialName && partialName.length > 0) {
      filtered = filtered.filter((team) => team.teamName.toLowerCase().includes(partialName.toLowerCase()) || team.shortName.toLowerCase().includes(partialName.toLowerCase()));
    }

    return filtered.map(({ objectId: teamId }) => <TeamItem key={teamId} teamId={teamId} onClick={onClick} />);
  })();

  const onSubmit = () => {
    if (teamItems.length === 0) {
      formMethods.reset();
    } else if (teamItems.length === 1) {
      store.dispatch(changeWindowOrder({
        windows: [{
          id: `${WindowTypes.DIALOGIDENTITY}-${teamItems[0].key}`,
          value: {
            identityId: teamItems[0].key,
            type: WindowTypes.DIALOGIDENTITY,
          },
        }],
      }));

      formMethods.reset();
    }
  };

  return (
    <List
      dropdown
      checkWidth
      className="IdentityList"
      title={<Users />}
    >
      <SearchItem onSubmit={onSubmit} formMethods={formMethods} placeholder="Search by name" />
      {
        partialName && teamItems.length === 0
          ? ([<ListItem key="noMatch">No match found</ListItem>])
          : (teamItems)
      }
    </List>
  );
};

export default React.memo(TeamList);
