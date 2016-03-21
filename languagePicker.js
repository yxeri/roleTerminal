'use strict';

const defaultLanguage = require('rolehaven-config').app.defaultLanguage;

function appendLanguageCode(propertyName) {
  if (defaultLanguage !== '') {
    return propertyName + '_' + defaultLanguage;
  }

  return propertyName;
}

exports.appendLanguageCode = appendLanguageCode;
