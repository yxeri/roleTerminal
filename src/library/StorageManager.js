import { stringifyObject } from './Converters';

const StorageType = {
  DEVICEID: 'deviceId',
  TOKEN: 'token',
  USERID: 'userId',
};

const setLocalValue = (name, value) => {
  if (typeof value === 'string') {
    localStorage.setItem(name, value);
  } else {
    localStorage.setItem(name, stringifyObject(value));
  }
};

const getLocalValue = (name) => localStorage.getItem(name);

const removeLocalValue = (name) => localStorage.removeItem(name);

const removeToken = () => removeLocalValue(StorageType.TOKEN);

const removeUserId = () => removeLocalValue(StorageType.USERID);

export const resetUser = () => {
  removeToken();
  removeUserId();
};

export const getDeviceId = () => getLocalValue(StorageType.DEVICEID);

export const setDeviceId = (value) => setLocalValue(StorageType.DEVICEID, value);

export const getToken = () => getLocalValue(StorageType.TOKEN);

export const setToken = (value) => setLocalValue(StorageType.TOKEN, value);

export const getUserId = () => getLocalValue(StorageType.USERID);

export const setUserId = (value) => setLocalValue(StorageType.USERID, value);
