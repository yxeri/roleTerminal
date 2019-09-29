/*
 Copyright 2016 Carmilla Mina Jankovic

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

class EventCentral {
  constructor() {
    this.Events = {
      ERROR: 'Error',
      USER: 'User',
      USERS: 'Users',
      TEAM: 'Team',
      TEAMS: 'Teams',
      ROOM: 'Room',
      ROOMS: 'Rooms',
      ALIAS: 'Alias',
      ALIASES: 'Aliases',
      FORUM: 'Forum',
      FORUMS: 'Forums',
      FORUMPOST: 'Forum post',
      FORUMPOSTS: 'Forum posts',
      FORUMTHREAD: 'Forum thread',
      FORUMTHREADS: 'Forum threads',
      DEVICE: 'Device',
      DEVICES: 'Devices',
      DOCFILE: 'Doc file',
      DOCFILES: 'Doc files',
      GAMECODE: 'Game code',
      GAMECODES: 'Game codes',
      POSITION: 'Position',
      POSITIONS: 'Positions',
      SIMPLEMSG: 'Simple message',
      SIMPLEMSGS: 'Simple message',
      TRANSACTION: 'Transaction',
      TRANSACTIONS: 'Transactions',
      WALLET: 'Wallet',
      WALLETS: 'Wallets',
      INVITATION: 'Invitation',
      INVITATIONS: 'Invitations',
      MESSAGE: 'Message',
      MESSAGES: 'Messages',
      STARTUP: 'Startup',
      RECONNECT: 'Reconnect',
      CHATMSG: 'Chat message',
      BOOT: 'Boot complete',
      LOGOUT: 'Logged out',
      LOGIN: 'Logged in',
      OPEN_DOCFILE: 'Open file',
      ACCESS_DOCFILE: 'Access file',
      SWITCH_ROOM: 'Switched room',
      SWITCH_FORUM: 'Switched forum',
      TRY_VIEW_SWITCH: 'Trying to switch view',
      SWITCH_LANGUAGE: 'Switched language',
      WORLDMAP: 'World map created',
      FOCUS_MAPPOSITION: 'Focus on map position',
      FOCUS_USER_MAPPOSITION: 'Focus on user map position',
      ZOOM_WORLDMAP: 'Changed zoom level on world map',
      ACCESS_CHANGE: 'Access level has changed',
      MARKER_DESCRIPTION: 'Map marker description',
      USER_CHANGE: 'User has logged in/logged out/reconnected',
      CHANGED_ALIAS: 'Changed current alias',
      VIEW_SWITCHED: 'View has changed',
      FOLLOWED_ROOM: 'Followed new room',
      OPEN_TEAM: 'Open team',
      COMPLETE_FORUM: 'Forum dependencies fetched',
      COMPLETE_MESSAGE: 'Message dependencies fetched',
      COMPLETE_POSITION: 'Position dependencies fetched',
      COMPLETE_ALIAS: 'Alias dependencies fetched',
      COMPLETE_USER: 'User dependencies fetched',
      COMPLETE_DOCFILE: 'Doc file dependencies fetched',
      COMPLETE_ROOM: 'Room dependencies fetched',
      COMPLETE_WALLET: 'Wallet dependencies fetched',
      COMPLETE_TRANSACTION: 'Transaction dependencies fetched',
      COMPLETE_TEAM: 'Team dependencies fetched',
      COMPLETE_INVITATION: 'Invitation dependencies fetched',
      LEFT_TEAM: 'Left team',
      MY_POSITION: 'User position',
      SHOW_MAP_CLICK_BOX: 'Map box is shown',
      AGED_POSITIONS: 'Positions are old',
      TEAM_MEMBER: 'Team member change',
      ONLINE: 'Online',
      OFFLINE: 'Offline',
    };
    this.eventWatchers = {};
  }

  /**
   * Adds a watcher for events.
   * @param {Object} params Parameters.
   * @param {string} params.event Name of the event to listen for.
   * @param {Function} params.func Function to call.
   */
  addWatcher({ event, func }) {
    if (!this.eventWatchers[event]) {
      this.eventWatchers[event] = [];
    }

    this.eventWatchers[event].push({ func });
  }

  /**
   * Emit event.
   * @param {Object} params Parameters.
   * @param {string} params.event Event to emit.
   * @param {Object} [params.params] Parameters to send.
   */
  emitEvent({
    event,
    params = {},
  }) {
    console.log(event, params);

    if (this.eventWatchers[event]) {
      this.eventWatchers[event].forEach(watcher => watcher.func(params));
    }
  }
}

const eventCentral = new EventCentral();

module.exports = eventCentral;
