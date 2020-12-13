import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { number, shape, string } from 'prop-types';
import { getIdentity } from '../../../../redux/selectors/users';
import { getTimestamp } from '../../../../redux/selectors/config';
import { createDialog } from '../../../helper';

import './MessageInfo.scss';
import UserDialog from '../../../common/dialogs/UserDialog';

const MessageInfo = ({ message }) => {
  const [dialog, setDialog] = useState();
  const identity = useSelector((state) => getIdentity(state, { identityId: message.ownerAliasId || message.ownerId }));
  const timestamp = useSelector((state) => getTimestamp(state, { date: message.customTimeCreated || message.timeCreated }));

  return (
    <>
      <p className="MessageInfo">
        <span
          role="button"
          tabIndex={0}
          className="clickable username"
          onClick={() => {
            if (identity) {
              setDialog(createDialog(<UserDialog userId={identity.objectId} done={() => setDialog()} />));
            }
          }}
        >
          {identity ? identity.username || identity.aliasName : '-'}
        </span>
        <span className="time">
          {timestamp.fullStamp}
        </span>
      </p>
      {dialog}
    </>
  );
};

export default React.memo(MessageInfo);

MessageInfo.propTypes = {
  message: shape({
    ownerId: string.isRequired,
    timeCreated: string.isRequired,
    ownerAliasId: string,
    customTimeCreated: number,
  }).isRequired,
};
