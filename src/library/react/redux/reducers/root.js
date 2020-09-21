import { ChangeTypes } from '../../SocketManager';

export const rootReducerSingle = (state, action) => {
  const newState = new Map([...state]);
  const { type, payload } = action;
  const { changeType } = payload;
  const object = payload[type];

  switch (changeType) {
    case ChangeTypes.CREATE: {
      newState.set(object.objectId, object);

      return newState;
    }
    case ChangeTypes.UPDATE: {
      newState.set(object.objectId, Object.assign(newState[object.objectId] || {}, object));

      return newState;
    }
    case ChangeTypes.REMOVE: {
      newState.delete(object.objectId);

      return newState;
    }
    default: {
      return state;
    }
  }
};

export const rootReducerMultiple = (state, action) => {
  const { type, payload } = action;
  const { reset, changeType } = payload;
  const newState = reset
    ? new Map()
    : new Map([...state]);
  const objects = payload[type];

  switch (changeType) {
    case ChangeTypes.CREATE: {
      objects.forEach((object) => newState.set(object.objectId, object));

      return newState;
    }
    case ChangeTypes.UPDATE: {
      objects.forEach((object) => newState.set(object.objectId, Object.assign(newState[object.objectId] || {}, object)));

      return newState;
    }
    case ChangeTypes.REMOVE: {
      objects.forEach((object) => newState.delete(object.objectId));

      return newState;
    }
    default: {
      return state;
    }
  }
};
