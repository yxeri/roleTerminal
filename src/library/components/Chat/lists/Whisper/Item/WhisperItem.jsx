import React from 'react';
import { useSelector } from 'react-redux';
import {
  arrayOf,
  func,
  shape,
  string,
} from 'prop-types';

import ListItem from '../../../../common/lists/List/ListItem/ListItem';
import { getCurrentUserIdentities, getIdentitiesByIds } from '../../../../../redux/selectors/users';

const WhisperItem = ({ room, onChange }) => {
  const identities = useSelector(getIdentitiesByIds(room.participantIds));
  const currentIdentities = useSelector(getCurrentUserIdentities);

  const { participantIds } = room;
  const participant = identities.get(participantIds[0]);
  const secondParticipant = identities.get(participantIds[1]);
  const name = currentIdentities
    .find(({ objectId }) => participant.objectId === objectId || participant.ownerId === objectId || participant.userIds.includes(objectId))
      ? `${participant.username || participant.aliasName} <-> ${secondParticipant.username || participant.aliasName}`
      : `${secondParticipant.username || participant.aliasName} <-> ${participant.username || participant.aliasName}`;

  return (
    <ListItem
      key={room.objectId}
      onClick={() => {
        onChange(room.objectId);
      }}
    >
      {name}
    </ListItem>
  );
};

export default React.memo(WhisperItem);

WhisperItem.propTypes = {
  room: shape({
    objectId: string,
    participantIds: arrayOf(string),
  }).isRequired,
  onChange: func.isRequired,
};
