const storageManager = require('../StorageManager');
const labels = require('./labels');

class LabelHandler {
  static getLabel({
    baseObject,
    label,
    prependSpace,
    appendSpace,
  }) {
    const language = storageManager.getLanguage() || 'en';

    if (!labels[baseObject] || !labels[baseObject][label] || (!labels[baseObject][label][language] && !labels[baseObject][label].en)) {
      return '';
    }

    let labelToReturn = labels[baseObject][label][language] || labels[baseObject][label].en;

    if (labelToReturn !== '') {
      if (prependSpace) { labelToReturn = ` ${labelToReturn}`; }
      if (appendSpace) { labelToReturn = `${labelToReturn} `; }
    }

    return labelToReturn;
  }
}

module.exports = LabelHandler;
