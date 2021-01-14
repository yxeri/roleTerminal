import {
  SendEvents,
  emitSocketEvent,
} from '../SocketManager';
import store from '../../redux/store';
import { createNewAlias, updateAliases } from '../../redux/actions/aliases';

export const createAlias = async (params) => {
  const result = await emitSocketEvent(SendEvents.ALIAS, params);

  await store.dispatch(createNewAlias(result));

  return result;
};

export const updateAlias = async ({
  aliasId,
  alias,
  image,
  resetImage,
}) => {
  const result = await emitSocketEvent(SendEvents.UPDATEALIAS, {
    aliasId,
    alias,
    image,
    options: { resetImage },
  });

  console.log(result);

  await store.dispatch(updateAliases({ aliases: [result.alias] }));

  return result;
};
