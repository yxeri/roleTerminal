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

require('../library/polyfills');

const socketManager = require('../library/SocketManager');
const storageManager = require('../library/StorageManager');
const eventCentral = require('../library/EventCentral');
const elementCreator = require('../library/ElementCreator');
const OnlineStatus = require('../library/view/templates/OnlineStatus');

const mainView = document.getElementById('main');
const usersView = document.getElementById('users');
const teamsView = document.getElementById('teams');
const roomsView = document.getElementById('rooms');
const messagesView = document.getElementById('messages');

const usersList = document.getElementById('listUsers');
const teamsList = document.getElementById('listTeams');
const roomsList = document.getElementById('listRooms');
const messagesList = document.getElementById('listMessages');

[usersView, teamsView, roomsView, messagesView].forEach((view) => {
  const top = view.firstElementChild;

  top.addEventListener('click', () => {
    view.lastElementChild.classList.toggle('hide');
  });
});

/**
 * Reset all lists
 */
function resetView() {
  usersList.innerHTML = '';
  teamsList.innerHTML = '';
  roomsList.innerHTML = '';
  messagesList.innerHTML = '';

  usersList.classList.add('hide');
  teamsList.classList.add('hide');
  roomsList.classList.add('hide');
  messagesList.classList.add('hide');
}

/**
 * Create user row
 * @param {Object} params.user User
 * @returns {Element} List item
 */
function createUserRow({ user }) {
  const listItem = document.createElement('LI');
  const banButton = document.createElement('BUTTON');
  const buttonContainer = document.createElement('DIV');

  buttonContainer.classList.add('buttonContainer');

  buttonContainer.appendChild(banButton);

  if (user.banned) {
    banButton.appendChild(document.createTextNode('Unban'));
    listItem.classList.add('banned');
  } else {
    banButton.appendChild(document.createTextNode('Ban'));
  }

  banButton.addEventListener('click', () => {
    if (user.banned) {
      socketManager.emitEvent('unban', { user }, (banData) => {
        if (banData.error) {
          console.log('Unban user', banData.error);

          return;
        }

        user.banned = false;
        listItem.classList.remove('banned');
        banButton.innerText = 'Ban';
      });
    } else {
      socketManager.emitEvent('ban', { user }, (banData) => {
        if (banData.error) {
          console.log('Unban user', banData.error);

          return;
        }

        user.banned = true;
        listItem.classList.add('banned');
        banButton.innerText = 'Unban';
      });
    }
  });

  listItem.appendChild(elementCreator.createSpan({ text: user.userName }));
  listItem.appendChild(elementCreator.createSpan({ text: user.mail }));
  listItem.appendChild(elementCreator.createSpan({ text: `Aliases: ${user.aliases ? user.aliases.join(', ') : '-'}` }));
  listItem.appendChild(elementCreator.createSpan({ text: `Warnings: ${user.warnings || 0}` }));

  if (user.team) { listItem.appendChild(elementCreator.createSpan({ text: `Team: ${user.team || '-'}` })); }

  listItem.appendChild(buttonContainer);

  return listItem;
}

/**
 * Create room row
 * @param {Object} params.room Room
 * @returns {Element} List item
 */
function createRoomRow({ room }) {
  const listItem = document.createElement('LI');
  const roomNameSpan = document.createElement('SPAN');

  roomNameSpan.appendChild(document.createTextNode(room.roomName));
  listItem.appendChild(roomNameSpan);

  return listItem;
}

/**
 * Populate all lists
 */
function populateAll() {
  socketManager.emitEvent('listUsers', { includeInactive: true }, (usersData) => {
    if (usersData.error) {
      console.log('listUsers error', usersData.error);

      return;
    }

    socketManager.emitEvent('listAliases', { includeInactive: true }, (aliasesData) => {
      if (aliasesData.error) {
        console.log('listAliases error', aliasesData.error);

        return;
      }

      const users = usersData.data.users;
      const { aliases } = aliasesData.data;
      const allUsers = users.filter(user => aliases.indexOf(user.userName) === -1).sort();

      const fragment = document.createDocumentFragment();

      usersList.classList.add('hide');
      usersList.innerHTML = '';

      allUsers.map(user => createUserRow({ user })).forEach(row => fragment.appendChild(row));

      usersList.appendChild(fragment);
    });
  });

  socketManager.emitEvent('getRooms', {}, (roomsData) => {
    if (roomsData.error) {
      console.log('listRooms error', roomsData.error);

      return;
    }

    const { rooms = [] } = roomsData.data;

    const fragment = document.createDocumentFragment();

    roomsList.classList.add('hide');
    roomsList.innerHTML = '';

    rooms.filter(room => room.roomName.indexOf('-team') === -1 && room.roomName.indexOf('-whisper') === -1).map(room => createRoomRow({ room })).forEach(row => fragment.appendChild(row));

    roomsList.appendChild(fragment);
  });
}

/**
 * Create interface
 */
function start() {
  if (storageManager.getAccessLevel() < 9) {
    mainView.appendChild(document.createTextNode('You are not an admin'));

    return;
  }

  const onlineStatus = new OnlineStatus(document.getElementById('onlineStatus'));

  socketManager.addEvents([
    {
      event: 'disconnect',
      func: () => {
        onlineStatus.setOffline();
        resetView();
      },
    }, {
      event: 'reconnect',
      func: () => {
        onlineStatus.setOnline();
        socketManager.reconnectDone();
        populateAll();
      },
    }, {
      event: 'startup',
      func: () => {
        onlineStatus.setOnline();
        populateAll();
      },
    }, {
      event: 'room',
      func: ({ room, isProtected }) => {
        eventCentral.triggerEvent({
          event: eventCentral.Events.NEWROOM,
          params: { room, isProtected },
        });
      },
    }, {
      event: 'team',
      func: ({ team }) => {
        eventCentral.triggerEvent({
          event: eventCentral.Events.NEWTEAM,
          params: { team },
        });
      },
    },
  ]);

  eventCentral.addWatcher({
    watcherParent: usersView,
    event: eventCentral.Events.LOGOUT,
    func: () => {
      storageManager.removeUser();
      eventCentral.triggerEvent({ event: eventCentral.Events.USER, params: { changedUser: true } });
    },
  });

  eventCentral.addWatcher({
    watcherParent: this,
    event: eventCentral.Events.USER,
    func: ({ changedUser }) => {
      if (changedUser) {
        resetView();
      }

      populateAll();
    },
  });
}

start();
