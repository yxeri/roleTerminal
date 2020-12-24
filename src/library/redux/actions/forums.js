import { FORUM, FORUMS } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const updateForums = ({ forums }) => {
  if (forums.length === 1) {
    return {
      type: FORUM,
      payload: {
        forum: forums[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: FORUMS,
    payload: {
      forums,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createForums = ({ forums }) => {
  if (forums.length === 1) {
    return {
      type: FORUM,
      payload: {
        forum: forums[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: FORUMS,
    payload: {
      forums,
      changeType: ChangeTypes.CREATE,
    },
  };
};
