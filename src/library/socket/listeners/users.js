import { ChangeTypes } from '../../redux/reducers/root';
import store from '../../redux/store';
import { createUsers, updateUsers } from '../../redux/actions/users';

const events = {
  USER: 'user',
};

export const user = () => ({
  event: events.USER,
  callback: ({ data }) => {
    if (data && data.user) {
      const { user: sentUser, changeType } = data;

      console.log(data);

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createUsers({ users: [sentUser] }));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateUsers({ users: [sentUser] }));
      }
    }
  },
});
