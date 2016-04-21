'use strict';

const defaultLanguage = require('rolehaven-config').app.defaultLanguage;

/**
 * Appends property name with the set default language in the configuration
 * @param propertyName Name of the property
 * @returns String Returns property name with the set default language in the configuration
 */
function appendLanguageCode(propertyName) {
  if (defaultLanguage !== '') {
    return `${propertyName}_${defaultLanguage}`;
  }

  return propertyName;
}

exports.appendLanguageCode = appendLanguageCode;
