import { getDeviceId } from '../../StorageManager';

export const getDeviceById = (state, { id }) => state.devices.get(id);

export const getThisDevice = (state) => state.devices.get(getDeviceId());
