import store from '../../redux/store';
import { batch } from 'react-redux';

import { createRooms, removeRooms, updateRooms } from '../../redux/actions/rooms';
import { ChangeTypes } from '../../redux/reducers/root';
import { updateUsers } from '../../redux/actions/users';

const events = {
  ROOM: 'room',
  FOLLOWER: 'follower',
  FOLLOW: 'followRoom',
};

export const room = () => ({
  event: events.ROOM,
  callback: ({ error, data }) => {
    if (data && data.room) {
      const { room: sentRoom, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createRooms({ rooms: [sentRoom] }));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateRooms({ rooms: [sentRoom] }));
      } else if (changeType === ChangeTypes.REMOVE) {
        store.dispatch(removeRooms({ rooms: [sentRoom] }));
      }

      return;
    }

    console.log('Error', events.ROOM, error, data);
  },
});

export const follow = () => ({
  event: events.FOLLOW,
  callback: ({ error, data }) => {
    if (data && data.room && data.user) {
      store.dispatch(async (dispatch) => {
        batch(() => {
          dispatch(updateRooms({ rooms: [data.room] }));
          dispatch(updateUsers({ users: [data.user] }));

          console.log(store.getState());
        });
      });

      return;
    }

    console.log('Error', events.FOLLOW, error, data);
  },
});
