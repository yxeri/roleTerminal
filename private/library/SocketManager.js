/*
 Copyright 2015 Carmilla Mina Jankovic

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

const storageManager = require('./StorageManager');
const eventCentral = require('./EventCentral');
const textTools = require('./TextTools');
const notificationManager = require('./NotificationManager');

class SocketManager {
  constructor() {
    this.socket = io(typeof ioUri !== 'undefined' // eslint-disable-line no-undef
      ? ioUri // eslint-disable-line no-undef
      : '/', { forceNew: true });
    this.lastAlive = (new Date()).getTime();
    this.reconnecting = false;
    this.hasConnected = false;
    this.isOnline = false;

    this.EmitTypes = {
      FORUM: 'forum',
      FORUMTHREAD: 'forumThread',
      FORUMPOST: 'forumPost',
      FOLLOW: 'followRoom',
      USER: 'user',
      CHATMSG: 'chatMsg',
      DEVICE: 'device',
      DOCFILE: 'docFile',
      WHISPER: 'whisper',
      BROADCAST: 'broadcast',
      GAMECODE: 'gameCode',
      ALIAS: 'alias',
      CREATEPOSITION: 'createPosition',
      POSITION: 'position',
      ROOM: 'room',
      FOLLOWER: 'follower',
      TEAM: 'team',
      INVITATION: 'invitation',
      TEAMMEMBER: 'team member',
      LOGOUT: 'logout',
      BAN: 'ban',
      WALLET: 'wallet',
      TRANSACTION: 'transaction',
      DISCONNECT: 'disconnect',
      RECONNECT: 'reconnect',
      STARTUP: 'startup',
      SENDMSG: 'sendMessage',
      UPDATEPOSITION: 'updatePosition',
      UPDATEPOSITIONCOORDINATES: 'updatePositionCoordinates',
      UNLOCKDOCFILE: 'unlockDocFile',
      GETROOMMSGS: 'getMessagesByRoom',
      BANUSER: 'banUser',
      UNBANUSER: 'unbanUser',
      VERIFYUSER: 'verifyUser',
      CHANGEPASSWORD: 'changePassword',
      UPDATEUSER: 'updateUser',
      UPDATEWALLET: 'updateWallet',
      UNFOLLOW: 'unfollowRoom',
      CREATETRANSACTION: 'createTransaction',
      INVITETEAM: 'inviteToTeam',
      LEAVETEAM: 'leaveTeam',
      SIMPLEMSG: 'simpleMsg',
      INVITEROOM: 'inviteToRoom',
      DECLINEINVITE: 'decline',
      ACCEPTTEAM: 'acceptTeamInvitation',
      ACCEPTROOM: 'acceptRoomInvitation',
      SENDROOMINVITE: 'sendInvitationToRoom',
      GETUSERBYCODE: 'getUserByCode',
    };
    this.ChangeTypes = {
      UPDATE: 'update',
      CREATE: 'create',
      REMOVE: 'remove',
    };

    this.addEvents([{
      event: this.EmitTypes.STARTUP,
      func: ({ data }) => {
        const {
          publicRoomId,
          defaultLanguage,
          centerCoordinates,
          cornerOneCoordinates,
          cornerTwoCoordinates,
          defaultZoomLevel,
          yearModification,
          dayModification,
          requireOffName,
          allowedImages,
          customUserFields,
          defaultForum,
          permissions = {},
        } = data;

        if (!storageManager.getDeviceId()) {
          storageManager.setDeviceId(textTools.createAlphaNumbericalString(16));
        }

        if (publicRoomId) { storageManager.setPublicRoomId(publicRoomId); }
        if (defaultLanguage) { storageManager.setLanguage(defaultLanguage); }
        if (centerCoordinates) { storageManager.setCenterCoordinates(centerCoordinates); }
        if (cornerOneCoordinates) { storageManager.setCornerOneCoordinates(cornerOneCoordinates); }
        if (cornerTwoCoordinates) { storageManager.setCornerTwoCoordinates(cornerTwoCoordinates); }
        if (defaultZoomLevel) { storageManager.setDefaultZoomLevel(defaultZoomLevel); }
        if (yearModification) { storageManager.setYearModification(yearModification); }
        if (dayModification) { storageManager.setDayModification(dayModification); }
        if (requireOffName) { storageManager.setRequireOffName(requireOffName); }

        storageManager.setDefaultForum(defaultForum);
        storageManager.setAllowedImages(allowedImages);
        storageManager.setPermissions(permissions);
        storageManager.setCustomUserFields(customUserFields);

        if (!this.hasConnected) {
          this.isOnline = true;
          this.hasConnected = true;

          this.updateId(() => {
            eventCentral.emitEvent({
              event: eventCentral.Events.STARTUP,
              params: { reset: true },
            });
            eventCentral.emitEvent({
              event: eventCentral.Events.ACCESS_CHANGE,
              params: { accessLevel: storageManager.getAccessLevel() },
            });
            eventCentral.emitEvent({
              event: eventCentral.Events.USER_CHANGE,
              params: {},
            });
            eventCentral.emitEvent({
              event: eventCentral.Events.ONLINE,
              params: {},
            });
          });
        }
      },
    }, {
      event: this.EmitTypes.RECONNECT,
      func: () => {
        this.updateId(() => {
          this.reconnectDone();

          eventCentral.emitEvent({
            event: eventCentral.Events.RECONNECT,
            params: {},
          });

          eventCentral.emitEvent({
            event: eventCentral.Events.ONLINE,
            params: {},
          });
        });
      },
    }, {
      event: this.EmitTypes.DISCONNECT,
      func: () => {
        this.isOnline = false;

        eventCentral.emitEvent({
          event: eventCentral.Events.OFFLINE,
          params: {},
        });
      },
    }, {
      event: this.EmitTypes.BAN,
      func: () => {
        this.logout({ callback: () => {} });
      },
    }]);

    /**
     * Checks if the screen has been unresponsive for some time.
     * Some devices disable Javascript when screen is off (iOS).
     * They also fail to notice that they have been disconnected.
     * The time between heartbeats is checked and a forced reconnect will be done if it's over 10 seconds.
     */
    const timeoutFunc = () => {
      const now = (new Date()).getTime();
      const diff = now - this.lastAlive;
      const offBy = diff - 1000;
      this.lastAlive = now;

      if (offBy > 10000) {
        this.reconnect({});
      }

      setTimeout(timeoutFunc, 1000);
    };

    timeoutFunc();
  }

  addEvent(event, callback) {
    this.socket.on(event, (params) => { console.log(event, params); callback(params); });
  }

  addEvents(events) {
    events.forEach((event) => this.addEvent(event.event, event.func));
  }

  updateId(callback) {
    if (!storageManager.getUserId()) {
      callback({ data: { success: true } });

      return;
    }

    this.emitEvent('updateId', {
      device: { objectId: storageManager.getDeviceId() },
    }, ({ error }) => {
      if (error) {
        storageManager.resetUser();

        callback({ error });

        return;
      }

      callback({ data: { success: true } });
    });
  }

  /**
   * Reconnect to socket.io
   */
  reconnect() {
    if (!this.reconnecting) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  /**
   * Emit event through socket.io.
   * @param {string} event Event to emit.
   * @param {Object} [params] Parameters to send in the emit.
   * @param {Function} [callback] Callback.
   */
  emitEvent(event, params = {}, callback) {
    const paramsToSend = params;
    paramsToSend.token = storageManager.getToken();

    if (!this.isOnline) {
      this.reconnect();

      if (!callback) {
        this.socket.emit(event, paramsToSend);
      } else {
        this.socket.emit(event, paramsToSend, callback);
      }

      return;
    }

    if (!callback) {
      this.socket.emit(event, paramsToSend);
    } else {
      this.socket.emit(event, paramsToSend, callback);
    }
  }

  checkAndReconnect() {
    if (!this.isOnline) {
      this.reconnect();
    }
  }

  reconnectDone() {
    this.reconnecting = false;
    this.isOnline = true;
  }

  getIsOnline() {
    return this.isOnline;
  }

  login({
    username,
    password,
    callback,
  }) {
    this.emitEvent('login', {
      user: {
        username,
        password,
        pushToken: notificationManager.token,
      },
      device: { objectId: storageManager.getDeviceId() },
    }, ({ error, data }) => {
      if (error) {
        callback({ error });

        return;
      }

      const { token, user } = data;

      storageManager.setToken(token);

      callback({ data: { success: true } });

      eventCentral.emitEvent({
        event: eventCentral.Events.LOGIN,
        params: { user },
      });
    });
  }

  logout({ callback }) {
    this.emitEvent('logout', {}, ({ error }) => {
      if (error) {
        callback({ error });

        return;
      }

      storageManager.resetUser();

      eventCentral.emitEvent({
        event: eventCentral.Events.LOGOUT,
        params: {},
      });

      callback({ data: { success: true } });
    });
  }
}

const socketManager = new SocketManager();

module.exports = socketManager;
