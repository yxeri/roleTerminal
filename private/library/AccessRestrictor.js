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

class AccessRestrictor {
  constructor() {
    /**
     * Views with elements that should be revealed/hidden depending on the user's access level
     * @type {View[]}
     */
    this.accessViews = [];
  }

  /**
   * Add views with elements that should be revealed/hidden depending on the user's access level
   * @param {View} view - View
   */
  addAccessView(view) {
    this.accessViews.push(view);
  }

  /**
   * Triggers toggleAccessElements on all views and reveals/hides elements based on the user's access level
   * @param {number} accessLevel - User's access level
   */
  toggleAllAccessViews(accessLevel) {
    this.accessViews.forEach(view => view.toggleAccessElements(accessLevel));
  }
}

const accessRestrictor = new AccessRestrictor();

module.exports = accessRestrictor;
