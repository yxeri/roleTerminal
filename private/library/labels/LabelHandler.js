const storageManager = require('../StorageManager');

const labels = {
  List: {
    removedItem: {
      en: ['The item has been removed.'],
      se: ['Raden har raderats.'],
    },
  },
  ForumView: {
    removedForum: {
      en: ['The forum no longer exists.'],
      se: ['Forumet existerar inte.'],
    },
  },
  Dialog: {
    cancel: {
      en: ['Cancel'],
      se: ['Avbryt'],
    },
    login: {
      en: ['Login'],
      se: ['Logga in'],
    },
    register: {
      en: ['Register'],
      se: ['Registera'],
    },
  },
};

class LabelHandler {
  static getLabel({ baseObject, label }) {
    const language = storageManager.getLanguage();

    return labels[baseObject][label][language];
  }
}

module.exports = LabelHandler;
