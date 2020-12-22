import React from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { getIdentityById } from '../../../../redux/selectors/users';
import { getTimestamp } from '../../../../redux/selectors/config';
import { createDialog } from '../../../helper';

import './MessageInfo.scss';
import UserDialog from '../../../common/dialogs/IdentityDialog';

const MessageInfo = ({ identityId, timeCreated, onDialog }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));
  const timestamp = useSelector((state) => getTimestamp(state, { date: timeCreated }));

  return (
    <p className="MessageInfo">
      <span
        role="button"
        tabIndex={0}
        className="clickable username"
        onClick={() => {
          if (identity) {
            onDialog(createDialog(<UserDialog identityId={identity.objectId} done={() => onDialog()} />));
          }
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
  onDialog: func.isRequired,
};
