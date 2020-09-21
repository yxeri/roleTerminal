import textTools from '../../TextTools';
import React from 'react';
import { useSelector } from 'react-redux';
import { getIdentity } from '../../redux/selectors/users';

const MessageInfo = ({ message }) => {
  const identity = useSelector((state) => {
    return getIdentity(state, { identityId: message.ownerAliasId || message.ownerId });
  });

  return (
    <p className="msgInfo">
      <span
        className="clickable username"
        onClick={() => { console.log(message.ownerId); }}
      >
        {identity.username || identity.aliasName}
      </span>
      <span className="time">
        {textTools.generateTimestamp({ date: message.customTimeCreated || message.timeCreated }).fullStamp}
      </span>
    </p>
  );
};

export default MessageInfo;
