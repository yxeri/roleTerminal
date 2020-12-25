import { ChangeTypes } from '../../redux/reducers/root';
import store from '../../redux/store';
import { createAliases, updateAliases } from '../../redux/actions/aliases';

const events = {
  ALIAS: 'alias',
};

export const alias = () => ({
  event: events.ALIAS,
  callback: ({ error, data }) => {
    if (data && data.alias) {
      const { alias: sentAlias, changeType } = data;

      if (changeType === ChangeTypes.CREATE) {
        store.dispatch(createAliases({ aliases: [sentAlias] }));
      } else if (changeType === ChangeTypes.UPDATE) {
        store.dispatch(updateAliases({ aliases: [sentAlias] }));
      }

      return;
    }

    console.log(events.ALIAS, error, data);
  },
});
