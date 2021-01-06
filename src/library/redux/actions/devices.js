import { DEVICE, DEVICES } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const updateDevices = ({ devices }) => {
  if (devices.length === 1) {
    return {
      type: DEVICE,
      payload: {
        device: devices[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: DEVICES,
    payload: {
      devices,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createDevices = ({ devices }) => {
  if (devices.length === 1) {
    return {
      type: DEVICE,
      payload: {
        device: devices[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: DEVICES,
    payload: {
      devices,
      changeType: ChangeTypes.CREATE,
    },
  };
};
