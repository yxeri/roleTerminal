import { ALIASID } from '../actionTypes';
import { removeAliasId, setAliasId } from '../../StorageManager';

export const changeAliasId = ({ aliasId }) => {
  if (!aliasId) {
    removeAliasId();

    return {
      type: ALIASID,
      payload: { reset: true },
    };
  }

  setAliasId(aliasId);

  return {
    type: ALIASID,
    payload: {
      aliasId,
    },
  };
};
