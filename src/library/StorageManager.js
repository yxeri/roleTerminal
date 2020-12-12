import { convertToObject } from './Converters';

const StorageType = {
  DEVICEID: 'deviceId',
  TOKEN: 'token',
};

const setLocalValue = (name, value) => {
  if (typeof value === 'string') {
    localStorage.setItem(name, value);
  } else {
    localStorage.setItem(name, convertToObject(value));
  }
};

const getLocalValue = (name) => localStorage.getItem(name);

const removeLocalValue = (name) => localStorage.removeItem(name);

const removeToken = () => removeLocalValue(StorageType.TOKEN);

export const resetUser = () => removeToken();

export const getDeviceId = () => getLocalValue(StorageType.DEVICEID);

export const setDeviceId = (value) => setLocalValue(StorageType.DEVICEID, value);

export const getToken = () => getLocalValue(StorageType.TOKEN);

export const setToken = (value) => setLocalValue(StorageType.TOKEN, value);
