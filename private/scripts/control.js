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
 * Create user row
 * @param {Object} params.user User
 * @returns {Element} List item
 */
function createUserRow({ user }) {
  const listItem = document.createElement('LI');
  const userSpan = document.createElement('SPAN');
  const fullSpan = document.createElement('SPAN');
  const banButton = document.createElement('BUTTON');
  const verifyButton = document.createElement('BUTTON');
  const buttonContainer = document.createElement('DIV');

  buttonContainer.classList.add('buttonContainer');

  userSpan.appendChild(document.createTextNode(user.userName));
  fullSpan.appendChild(document.createTextNode(user.fullName));

  buttonContainer.appendChild(banButton);

  if (!user.verified) {
    verifyButton.appendChild(document.createTextNode('Verify'));
    buttonContainer.appendChild(verifyButton);

    if (!user.banned) {
      listItem.classList.add('unverified');
    }
  }

  if (user.banned) {
    banButton.appendChild(document.createTextNode('Unban'));
    listItem.classList.add('banned');
  } else {
    banButton.appendChild(document.createTextNode('Ban'));
  }

  banButton.addEventListener('click', () => {
    if (user.banned) {
      socketManager.emitEvent('ban', { user, shouldBan: false }, (banData) => {
        if (banData.error) {
          console.log('Unban user', banData.error);

          return;
        }

        listItem.classList.remove('banned');
        banButton.innerText = 'Unban';
      });
    } else {
      socketManager.emitEvent('ban', { user }, (banData) => {
        if (banData.error) {
          console.log('Unban user', banData.error);

          return;
        }

        listItem.classList.add('banned');
        banButton.innerText = 'Ban';
      });
    }
  });
  verifyButton.addEventListener('click', () => {
    if (!user.verified) {
      socketManager.emitEvent('verifyUser', { user }, (verifyData) => {
        if (verifyData.error) {
          console.log('Verify user', verifyData.error);

          return;
        }

        verifyButton.remove();
        listItem.classList.remove('unverified');
      });
    }
  });

  listItem.appendChild(userSpan);

  if (user.fullName !== user.userName) {
    listItem.appendChild(fullSpan);
  }

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
 * Create interface
 */
function start() {
  if (storageManager.getAccessLevel() < 9) {
    mainView.appendChild(document.createTextNode('You are not an admin'));

    return;
  }

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

      const { onlineUsers, offlineUsers } = usersData.data;
      const { aliases } = aliasesData.data;
      const allUsers = onlineUsers.concat(offlineUsers).filter(user => aliases.indexOf(user.userName) === -1).sort();

      const fragment = document.createDocumentFragment();

      usersList.classList.add('hide');
      usersList.innerHTML = '';

      allUsers.map(user => createUserRow({ user })).forEach(row => fragment.appendChild(row));

      usersList.appendChild(fragment);
    });
  });

  socketManager.emitEvent('listRooms', {}, (roomsData) => {
    if (roomsData.error) {
      console.log('listRooms error', roomsData.error);

      return;
    }

    const { rooms = [], followedRooms = [], ownedRooms = [], protectedRooms = [] } = roomsData.data;
    const allRooms = rooms.concat(followedRooms, ownedRooms, protectedRooms);

    const fragment = document.createDocumentFragment();

    roomsList.classList.add('hide');
    roomsList.innerHTML = '';

    allRooms.map(room => createRoomRow({ room })).forEach(row => fragment.appendChild(row));

    roomsList.appendChild(fragment);
  });

  eventCentral.addWatcher({
    watcherParent: usersView,
    event: eventCentral.Events.LOGOUT,
    func: () => {
      usersList.innerHTML = '';
      teamsList.innerHTML = '';
      roomsList.innerHTML = '';
      messagesList.innerHTML = '';

      usersList.classList.add('hide');
      teamsList.classList.add('hide');
      roomsList.classList.add('hide');
      messagesList.classList.add('hide');
    },
  });
}

start();
