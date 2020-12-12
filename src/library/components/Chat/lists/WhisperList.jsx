import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import { getChatRooms, RoomTypes } from '../../../redux/selectors/rooms';
import List from '../../common/sub-components/List/List';
import { getAllIdentities } from '../../../redux/selectors/users';
import { getUserId } from '../../../redux/selectors/userId';
import ListItem from '../../common/sub-components/List/ListItem/ListItem';

export default function WhisperList({ onChange }) {
  const rooms = useSelector((state) => getChatRooms(state, { roomType: RoomTypes.WHISPER }));
  const users = useSelector((state) => getAllIdentities(state, { getMap: true }));
  const userId = useSelector(getUserId);

  const roomMapper = () => rooms.map((room) => {
    const { participantIds } = room;
    const participant = users.get(participantIds[0]);
    const secondParticipant = users.get(participantIds[1]);
    const name = participant.objectId === userId || participant.ownerId === userId
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
  });

  return (
    <List
      title="PM"
    >
      {roomMapper()}
    </List>
  );
}

WhisperList.propTypes = {
  onChange: func.isRequired,
};
