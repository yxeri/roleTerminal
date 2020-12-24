import { ChangeTypes } from '../../redux/reducers/root';
import store from '../../redux/store';
import { createUsers, updateUsers } from '../../redux/actions/users';

const events = {
  ALIAS: 'alias',
};

export const user = () => ({
  event: events.ALIAS,
  callback: ({ data }) => {
    if (data && data.alias) {
      const { alias: sentAlias, changeType } = data;

      console.log(data);

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createAliases({ users: [sentAlias] }));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateUsers({ users: [sentAlias] }));
      }
    }
  },
});
