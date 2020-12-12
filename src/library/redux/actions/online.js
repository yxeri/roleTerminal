import { CONFIG, ONLINE } from '../actionTypes';
import { Status } from '../reducers/online';

export const online = () => ({
  type: ONLINE,
  payload: { online: Status.ONLINE },
});

export const offline = () => ({
  type: ONLINE,
  payload: { online: Status.OFFLINE },
});

export const startup = (config) => (dispatch) => {
  dispatch({
    type: CONFIG,
    payload: {
      entries: Object.entries(config),
    },
  });
  dispatch(online());
};
