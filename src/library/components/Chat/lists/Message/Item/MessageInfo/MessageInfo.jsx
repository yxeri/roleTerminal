import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import { getIdentityById } from '../../../../../../redux/selectors/users';
import { getTimestamp } from '../../../../../../redux/selectors/config';

import './MessageInfo.scss';
import store from '../../../../../../redux/store';
import { changeWindowOrder } from '../../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../../redux/reducers/windowOrder';

const MessageInfo = ({ identityId, timeCreated }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));
  const timestamp = useSelector((state) => getTimestamp(state, { date: timeCreated }));

  return (
    <p className="MessageInfo">
      <span
        role="button"
        tabIndex={0}
        className="clickable username"
        onClick={(event) => {
          if (identity) {
            store.dispatch(changeWindowOrder({
              windows: [{
                id: `${WindowTypes.DIALOGIDENTITY}-${identity.objectId}`,
                value: {
                  identityId: identity.objectId,
                  type: WindowTypes.DIALOGIDENTITY,
                },
              }],
            }));
          }

          event.stopPropagation();
        }}
      >
        {identity ? identity.username || identity.aliasName : '-'}
      </span>
      <span className="time">
        {timestamp.fullStamp}
      </span>
    </p>
  );
};

export default React.memo(MessageInfo);

MessageInfo.propTypes = {
  identityId: string.isRequired,
  timeCreated: string.isRequired,
};
