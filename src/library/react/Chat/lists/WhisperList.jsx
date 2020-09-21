import React from 'react';
import { useSelector } from 'react-redux';

import { getChatRooms, RoomTypes } from '../../redux/selectors/rooms';
import List from '../../common/sub-components/List';
import { getAllIdentities } from '../../redux/selectors/users';
import { getUserId } from '../../redux/selectors/userId';

const WhisperList = () => {
  const rooms = useSelector((state) => getChatRooms(state, { roomType: RoomTypes.WHISPER }));
  const users = useSelector((state) => getAllIdentities(state, { getMap: true }));
  const userId = useSelector(getUserId);

  return (
    <div
      key="whisperList"
      className="whisperList"
    >
      <List
        title="Whispers"
        items={rooms.map((room) => {
          const { participantIds } = room;
          const participant = users.get(participantIds[0]);
          const secondParticipant = users.get(participantIds[1]);
          const name = participant.objectId === userId || participant.ownerId === userId
            ? `${participant.username || participant.aliasName} <-> ${secondParticipant.username || participant.aliasName}`
            : `${secondParticipant.username || participant.aliasName} <-> ${participant.username || participant.aliasName}`;

          return {
            key: room.objectId,
            value: name,
          };
        })}
      />
    </div>
  );
};

export default WhisperList
