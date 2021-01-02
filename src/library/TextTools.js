/**
 * Beautifies number by adding a 0 before the number if it is lower than 10
 * @param {Number} number Number to be beautified
 * @returns {string} String with number or with 0 + number
 */
// TODO Use built-in padding
export const beautifyNumber = (number) => (number > 9
  ? `${number}`
  : `0${number}`
);

/**
 * Takes date and returns shorter human-readable time.
 * @static
 * @param {Object} params Parameters.
 * @param {Date|number} params.date Date.
 * @param {Number} [params.offset] Should hours be modified from the final time?
 * @param {boolean} [params.lockDate] Should the year stay unmodified?
 * @returns {Object} Human-readable time and date.
 */
export const getTimestamp = ({
  date,
  offset,
  lockDate,
  yearModification,
  dayModification,
}) => {
  const newDate = new Date(date);
  const timestamp = {};

  if (offset) {
    newDate.setHours(newDate.getHours() + offset);
  }

  if (!lockDate && (yearModification || dayModification)) {
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
