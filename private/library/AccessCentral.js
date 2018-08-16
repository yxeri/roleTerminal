/*
 Copyright 2018 Carmilla Mina Jankovic

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

const eventCentral = require('./EventCentral');

class AccessCentral {
  constructor() {
    this.AccessLevels = {
      ANONYMOUS: 0,
      STANDARD: 1,
      PRIVILEGED: 2,
      MODERATOR: 3,
      ADMIN: 4,
      SUPERUSER: 5,
      GOD: 6,
    };
    this.accessElements = {};

    eventCentral.addWatcher({
      event: eventCentral.Events.ACCESS_CHANGE,
      func: ({ accessLevel }) => {
        Object.keys(this.accessElements).forEach((level) => {
          const levelElements = this.accessElements[level] || [];

          levelElements.forEach((accessElement) => {
            const {
              minimumAccessLevel,
              maxAccessLevel,
              element,
            } = accessElement;

            if (accessLevel >= minimumAccessLevel && accessLevel <= maxAccessLevel) {
              element.classList.remove('hide');
            } else {
              element.classList.add('hide');
            }
          });
        });
      },
    });
  }

  addAccessElement({
    element,
    minimumAccessLevel = 0,
    maxAccessLevel = 999,
  }) {
    if (!this.accessElements[minimumAccessLevel]) {
      this.accessElements[minimumAccessLevel] = [];
    }

    this.accessElements[minimumAccessLevel].push({
      element,
      minimumAccessLevel,
      maxAccessLevel,
    });
  }

  removeAccessElement({
    minimumAccessLevel,
    element,
  }) {
    if (!this.accessElements[minimumAccessLevel]) {
      this.accessElements[minimumAccessLevel] = [];
    }

    const levelElements = this.accessElements[minimumAccessLevel];

    levelElements.splice(levelElements.findIndex((accessElement) => {
      return accessElement.element === element;
    }), 1);
  }

  /**
   * Checks if user has access, is admin or can see the object.
   * @param {Object} params - Parameter.
   * @param {Object} params.objectToAccess - Object to access.
   * @param {Object} params.toAuth - Object to auth.
   * @returns {boolean} - Does the user have access to the object?
   */
  hasAccessTo({
    objectToAccess,
    toAuth,
  }) {
    const {
      teamIds = [],
      userIds = [],
      userAdminIds = [],
      teamAdminIds = [],
      ownerId,
      isPublic,
      visibility,
    } = objectToAccess;
    const {
      hasFullAccess,
      accessLevel = this.AccessLevels.ANONYMOUS,
      objectId: authUserId,
      teamIds: authTeamIds = [],
      aliases = [],
    } = toAuth;

    const userHasAccess = userIds.concat([ownerId]).includes(authUserId);
    const teamHasAccess = teamIds.find(teamId => authTeamIds.includes(teamId));
    const aliasHasAccess = aliases.find(aliasId => userIds.includes(aliasId));
    const userHasAdminAccess = userAdminIds.includes(authUserId);
    const aliasHasAdminAccess = aliases.find(aliasId => userAdminIds.includes(aliasId));
    const teamHasAdminAccess = teamAdminIds.find(adminId => authTeamIds.includes(adminId));
    const isAdmin = ownerId === authUserId || hasFullAccess || accessLevel >= this.AccessLevels.ADMIN;

    return {
      canSee: isAdmin || isPublic || userHasAccess || teamHasAccess || aliasHasAccess || accessLevel >= visibility,
      hasAccess: isAdmin || isPublic || userHasAccess || teamHasAccess || aliasHasAccess,
      hasFullAccess: isAdmin || userHasAdminAccess || teamHasAdminAccess || aliasHasAdminAccess,
    };
  }
}

const accessCentral = new AccessCentral();

module.exports = accessCentral;
