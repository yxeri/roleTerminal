import store from '../../redux/store';
import { createRooms } from '../../redux/actions/rooms';
import { ChangeTypes } from '../../redux/reducers/root';

const events = {
  ROOM: 'room',
  FOLLOWER: 'follower',
};

export const room = () => ({
  event: events.ROOM,
  callback: ({ data }) => {
    if (data && data.room) {
      const { room: sentRoom, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createRooms({ rooms: [sentRoom] }));
      }
    }
  },
});
