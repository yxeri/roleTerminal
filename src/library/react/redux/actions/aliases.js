import { ALIAS, ALIASES } from '../actionTypes';
import { ChangeTypes } from '../../SocketManager';

export const createAlias = (alias) => {
  return {
    type: ALIAS,
    payload: {
      alias,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateAlias = ((alias) => {
  return {
    type: ALIAS,
    payload: {
      alias,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeAlias = (alias) => {
  return {
    type: ALIAS,
    payload: {
      alias,
      changeType: ChangeTypes.REMOVE,
    },
  };
};

export const createAliases = (aliases) => {
  return {
    type: ALIASES,
    payload: {
      aliases,
      changeType: ChangeTypes.CREATE,
    },
  };
};

export const updateAliases = ((aliases) => {
  return {
    type: ALIASES,
    payload: {
      aliases,
      changeType: ChangeTypes.UPDATE,
    },
  };
});

export const removeAliases = (aliases) => {
  return {
    type: ALIASES,
    payload: {
      aliases,
      changeType: ChangeTypes.REMOVE,
    },
  };
};
