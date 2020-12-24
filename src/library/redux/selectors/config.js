import { beautifyNumber } from '../../TextTools';

export const getRequireOffName = (state) => state.config.get('requireOffName');
export const getPublicRoomId = (state) => state.config.get('publicRoomId');
export const getBroadcastId = (state) => state.config.get('broadcastId');
export const getAnonymousUser = (state) => state.config.get('anonymousUser');
export const getAllowedImages = (state) => state.config.get('allowedImages');
export const getGpsTracking = (state) => state.config.get('gpsTracking');
export const getPermissions = (state) => state.config.get('permissions');

/**
 * Takes date and returns shorter human-readable time.
 * @static
 * @param {Object} params Parameters.
 * @param {Date|number} params.date Date.
 * @param {Number} [params.offset] Should hours be modified from the final time?
 * @param {boolean} [params.lockDate] Should the year stay unmodified?
 * @returns {Object} Human-readable time and date.
 */
export const getTimestamp = (state, { date, offset, lockDate }) => {
  const newDate = new Date(date);
  const timestamp = {};
  const { yearModification, dayModification } = state.config;

  if (offset) {
    newDate.setHours(newDate.getHours() + offset);
  }

  if (!lockDate && !Number.isNaN(yearModification)) {
    if (yearModification && !Number.isNaN(yearModification)) {
      newDate.setFullYear(newDate.getFullYear() + parseInt(yearModification, 10));
    }

    if (dayModification && !Number.isNaN(dayModification)) {
      newDate.setDate(newDate.getDate() + parseInt(dayModification, 10));
    }
  }

  timestamp.mins = beautifyNumber(newDate.getMinutes());
  timestamp.hours = beautifyNumber(newDate.getHours());
  timestamp.seconds = beautifyNumber(newDate.getSeconds());
  timestamp.month = beautifyNumber(newDate.getMonth() + 1);
  timestamp.day = beautifyNumber(newDate.getDate());
  timestamp.year = newDate.getFullYear();
  timestamp.halfTime = `${timestamp.hours}:${timestamp.mins}`;
  timestamp.fullTime = `${timestamp.halfTime}:${timestamp.seconds}`;
  timestamp.halfDate = `${timestamp.day}/${timestamp.month}`;
  timestamp.fullDate = `${timestamp.halfDate}/${timestamp.year}`;
  timestamp.fullStamp = `${timestamp.halfTime} ${timestamp.fullDate}`;

  return timestamp;
};
