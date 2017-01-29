/*
 Copyright 2015 Aleksandar Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// TODO Change Map to array

// class LabelManager {
//   constructor({ defaultLanguageCode }) {
//     this.LanguageCodeEnum = {
//       ENGLISH: 'EN',
//       SWEDISH: 'SE',
//     };
//     this.defaultLanguageCode = defaultLanguageCode;
//     this.labels = new Map();
//   }
//
//   /**
//    * Appends a language code to property name. Example: errors_se. No appended language code is the default
//    * If no object with the property name and appended language code is found it will fall back to default
//    * @private
//    * @param {string} propertyName - Name of the property
//    * @param {string} [languageCode] - Language code
//    * @returns {string} - Property name with appended language code
//    */
//   appendLanguage(propertyName, languageCode) {
//     const languagePropertyName = languageCode || languageCode !== this.LanguageCodeEnum.ENGLISH ? `${propertyName}_${languageCode}` : propertyName;
//
//     if (this.labels.get(languagePropertyName)) {
//       return languagePropertyName;
//     }
//
//     return propertyName;
//   }
//
//   /**
//    * Add labels
//    * @param {Object} params - Parameters
//    * @param {string} params.category - Category to add the labels to
//    * @param {Object[]} params.newLabels - Labels to be added
//    * @param {string} params.newLabels[].labelName - Name of the label. Will be set as property name
//    * @pafram {string[]} params.newLabels[].text - Text for the label. Each index represents a new line
//    * @param {string} [params.languageCode] - Language code
//    */
//   addLabels({ category, newLabels, languageCode }) {
//     const fullCategory = this.appendLanguage(category, languageCode);
//
//     if (!this.labels.get(fullCategory)) {
//       this.labels.set(fullCategory, new Map());
//     }
//
//     for (const label of newLabels) {
//       this.labels.get(fullCategory).set(label.labelName, label.text);
//     }
//   }
//
//   /**
//    * Retrieves correct property from objects in labels. Returns null if a property is not found
//    * @param {string} category - Category name
//    * @param {string} value - Property name
//    * @param {string} [languageCode] - Language code
//    * @returns {string|null} - Retrieved label from category_language[name]
//    */
//   getLabel({ category, value, languageCode }) {
//     const fullCategory = this.labels.get(this.appendLanguage(category, languageCode));
//
//     if (fullCategory && fullCategory.get(value)) {
//       return JSON.parse(JSON.stringify(fullCategory.get(value)));
//     }
//
//     return null;
//   }
// }
//
// module.exports = LabelManager;
