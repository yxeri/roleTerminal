/*
 Copyright 2017 Aleksandar Jankovic

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

/**
 * Views with elements that should be revealed/hidden depending on the user's access level
 * @type {View[]}
 */
const accessViews = [];

/**
 * Add views with elements that should be revealed/hidden depending on the user's access level
 * @param {View} view - View
 */
function addAccessView(view) {
  accessViews.push(view);
}

/**
 * Triggers toggleAccessElements on all views and reveals/hides elements based on the user's access level
 * @param {number} accessLevel - User's access level
 */
function toggleAllAccessViews(accessLevel) {
  accessViews.forEach(view => view.toggleAccessElements(accessLevel));
}

exports.addAccessView = addAccessView;
exports.toggleAllAccessViews = toggleAllAccessViews;
