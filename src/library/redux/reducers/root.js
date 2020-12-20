export const ChangeTypes = {
  UPDATE: 'update',
  CREATE: 'create',
  REMOVE: 'remove',
  RESET: 'reset',
};

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
      const existing = newState[object.objectId];
      const updated = Object.assign(existing || {}, object);

      if (existing === updated) {
        return state;
      }

      newState.set(object.objectId, updated);

      return newState;
    }
    case ChangeTypes.REMOVE: {
      if (!newState.has(object.objectId)) {
        return state;
      }

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
      objects
        .forEach((object) => {
          const existing = newState[object.objectId];
          const updated = Object.assign(existing || {}, object);

          if (existing !== updated) {
            newState.set(object.objectId, updated);
          }
        });

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
