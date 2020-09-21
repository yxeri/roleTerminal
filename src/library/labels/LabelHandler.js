import storageManager from '../react/StorageManager';
import labels from './labels';

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

  static setBaseLabel({
    name,
    object,
  }) {
    labels[name] = object;
  }

  static setLabel({
    baseObject,
    labelName,
    label,
    language = 'en',
  }) {
    labels[baseObject][labelName][language] = label;
  }
}

export default LabelHandler;
