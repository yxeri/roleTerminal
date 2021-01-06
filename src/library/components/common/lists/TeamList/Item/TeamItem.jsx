import React, { useCallback } from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import ListItem from '../../List/Item/ListItem';
import { getTeamById } from '../../../../../redux/selectors/teams';
import Image from '../../../sub-components/Image/Image';

const TeamItem = ({ teamId, onClick }) => {
  const team = useSelector((state) => getTeamById(state, { id: teamId }));

  const onClickCall = useCallback(() => {
    if (onClick) {
      onClick();
    }

    store.dispatch(changeWindowOrder({
      windows: [{
        id: `${WindowTypes.DIALOGIDENTITY}-${identityId}`,
        value: {
          identityId,
          type: WindowTypes.DIALOGIDENTITY,
        },
      }],
    }));
  }, [teamId]);

  return (
    <ListItem
      key={teamId}
      onClick={onClickCall}
    >
      <div className="title">
        {team.image && (
          <Image image={`/upload/images/${team.image.fileName}`} width="100%" height="100%" />
        )}
      </div>
    </ListItem>
  );
};

export default React.memo(TeamItem);

TeamItem.propTypes = {
  teamId: string.isRequired,
  onClick: func,
};

TeamItem.defaultProps = {
  onClick: undefined,
};
