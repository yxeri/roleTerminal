import React from 'react';
import { useSelector } from 'react-redux';
import { number, shape, string } from 'prop-types';
import { getIdentity } from '../../../redux/selectors/users';
import { getTimestamp } from '../../../redux/selectors/config';

export default function MessageInfo({ message }) {
  const identity = useSelector((state) => getIdentity(state, { identityId: message.ownerAliasId || message.ownerId }));
  const timestamp = useSelector((state) => getTimestamp(state, { date: message.customTimeCreated || message.timeCreated }));

  return (
    <p className="msgInfo">
      <span
        role="button"
        tabIndex={0}
        className="clickable username"
        onKeyPress={() => console.log(message.ownerId)}
        onClick={() => console.log(message.ownerId)}
      >
        {identity.username || identity.aliasName}
      </span>
      <span className="time">
        {timestamp.fullStamp}
      </span>
    </p>
  );
}

MessageInfo.propTypes = {
  message: shape({
    ownerId: string.isRequired,
    timeCreated: string.isRequired,
    ownerAliasId: string,
    customTimeCreated: number,
  }).isRequired,
};
