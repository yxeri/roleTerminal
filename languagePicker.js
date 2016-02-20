'use strict';

const appConfig = require('rolehaven-config').app;

function appendLanguageCode(propertyName) {
  if (appConfig.defaultLanguage !== '') {
    return propertyName + '_' + appConfig.defaultLanguage;
  }

  return propertyName;
}

exports.appendLanguageCode = appendLanguageCode;