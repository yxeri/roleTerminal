import { ChangeTypes } from '../../redux/reducers/root';
import store from '../../redux/store';
import { createUsers, updateUsers } from '../../redux/actions/users';

const events = {
  USER: 'user',
};

export const user = () => ({
  event: events.USER,
  callback: ({ error, data }) => {
    if (data && data.user) {
      const { user: sentUser, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createUsers({ users: [sentUser] }));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateUsers({ users: [sentUser] }));
      }

      return;
    }

    console.log(events.USER, error, data);
  },
});
