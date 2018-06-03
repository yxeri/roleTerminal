/*
 Copyright 2018 Aleksandar Jankovic

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

const BaseView = require('./BaseView');
const LoginDialog = require('../../components/views/dialogs/LoginDialog');
const RegisterDialog = require('../../components/views/dialogs/RegisterDialog');
const RoomDialog = require('../../components/views/dialogs/RoomDialog');
const DocFileDialog = require('../../components/views/dialogs/DocFileDialog');

const elementCreator = require('../../ElementCreator');
const textTools = require('../../TextTools');
const labelHandler = require('../../labels/LabelHandler');
const accessCentral = require('../../AccessCentral');
const socketManager = require('../../SocketManager');
const eventCentral = require('../../EventCentral');
const storageManager = require('../../StorageManager');
const aliasComposer = require('../../data/AliasComposer');
const userComposer = require('../../data/UserComposer');

class TopView extends BaseView {
  constructor({
    title,
    showControls = {},
    showClock = true,
    menuItems = [],
    classes = [],
    elementId = `topView-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['topView']),
    });

    const controls = showControls;
    controls.user = controls.user || true;
    controls.alias = controls.alias || true;

    const items = [];
    const lastItems = [];

    this.showClock = showClock;

    if (controls.user) {
      const logoutButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'logout' }),
        clickFuncs: {
          leftFunc: () => {
            socketManager.logout({
              callback: ({ error }) => {
                if (error) {
                  console.log('Failed to logout');

                  return;
                }

                console.log('Logged out');
              },
            });
          },
        },
      });
      const loginButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'login' }),
        clickFuncs: {
          leftFunc: () => {
            const login = new LoginDialog({});

            login.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });
      const registerButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'register' }),
        clickFuncs: {
          leftFunc: () => {
            const register = new RegisterDialog({});

            register.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });

      accessCentral.addAccessElement({
        maxAccessLevel: 0,
        element: loginButton,
      });
      accessCentral.addAccessElement({
        minimumAccessLevel: 1,
        element: logoutButton,
      });
      accessCentral.addAccessElement({
        maxAccessLevel: 0,
        element: registerButton,
      });

      items.push({
        elements: [loginButton],
      }, {
        elements: [registerButton],
      });
      lastItems.push({ elements: [logoutButton] });
    }

    /**
     * elements,
     clickFuncs,
     classes,
     elementId,
     */

    if (showControls.docFile) {
      const createDocFileButton = elementCreator.createButton({
        text: 'Create document',
        clickFuncs: {
          leftFunc: () => {
            const dialog = new DocFileDialog({});

            dialog.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });

      items.push({ elements: [createDocFileButton] });

      accessCentral.addAccessElement({
        element: createDocFileButton,
        minimumAccessLevel: 1,
      });
    }

    if (showControls.room) {
      const createRoomButton = elementCreator.createButton({
        text: 'Create room',
        clickFuncs: {
          leftFunc: () => {
            const dialog = new RoomDialog({});

            dialog.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });

      items.push({ elements: [createRoomButton] });

      accessCentral.addAccessElement({
        element: createRoomButton,
        minimumAccessLevel: 1,
      });
    }

    if (showControls.alias) {
      const createAliasButton = elementCreator.createButton({
        text: 'Create alias',
      });

      items.push({ elements: [createAliasButton] });

      accessCentral.addAccessElement({
        element: createAliasButton,
        minimumAccessLevel: 1,
      });
    }

    if (items.concat(menuItems, lastItems).length > 0) {
      this.menuList = elementCreator.createList({
        classes: ['hide', 'topMenu'],
        items: items.concat(menuItems, lastItems),
        clickFuncs: {
          leftFunc: () => {
            this.menuList.classList.add('hide');
          },
        },
      });
      const menuButton = elementCreator.createSpan({
        classes: ['topMenuButton'],
        text: labelHandler.getLabel({ baseObject: 'TopView', label: 'menu' }),
        clickFuncs: {
          leftFunc: () => {
            this.menuList.classList.toggle('hide');

            if (this.userList) { this.userList.classList.add('hide'); }
          },
        },
      });

      this.element.appendChild(elementCreator.createContainer({
        elements: [menuButton, this.menuList],
      }));
    }

    if (showControls.userList) {
      this.userList = elementCreator.createList({
        classes: ['hide', 'topMenu'],
        items: [elementCreator.createSpan({ text: 'user' })],
        clickFuncs: {
          leftFunc: () => {
            this.userList.classList.add('hide');
          },
        },
      });
      const menuButton = elementCreator.createSpan({
        classes: ['topMenuButton'],
        text: '-----',
        clickFuncs: {
          leftFunc: () => {
            this.userList.classList.toggle('hide');

            if (this.menuList) { this.menuList.classList.add('hide'); }
          },
        },
      });

      this.element.appendChild(elementCreator.createContainer({
        elements: [menuButton, this.userList],
      }));

      eventCentral.addWatcher({
        event: eventCentral.Events.COMPLETE_USER,
        func: () => {
          TopView.setUsername({ button: menuButton });
        },
      });

      eventCentral.addWatcher({
        event: eventCentral.Events.USER_CHANGE,
        func: () => {
          TopView.setUsername({ button: menuButton });
        },
      });
    }

    if (this.showClock) {
      this.timeSpan = elementCreator.createSpan({
        text: labelHandler.getLabel({ baseObject: 'TopView', label: 'emptyTime' }),
      });

      this.element.appendChild(this.timeSpan);

      this.updateClock();
    }

    if (title) {
      this.element.appendChild(elementCreator.createSpan({ text: title }));
    }
  }

  static setUsername({ button }) {
    const buttonToChange = button;
    const userId = storageManager.getUserId();
    const aliasId = storageManager.getAliasId();

    if (aliasId) {
      buttonToChange.textContent = aliasComposer.getAliasName({ aliasId });
    } else if (userId) {
      buttonToChange.textContent = userComposer.getUsername({ userId });
    } else {
      buttonToChange.textContent = '-----';
    }
  }

  updateClock() {
    if (!this.showClock) {
      return;
    }

    setTimeout(() => {
      const time = textTools.generateTimestamp({ date: Date.now() });

      if (!this.currentTime || time.mins !== this.currentTime.mins) {
        this.currentTime = textTools.generateTimestamp({ date: Date.now() });
        this.timeSpan.textContent = this.currentTime.halfTime;
      }

      this.updateClock();
    }, 100);
  }
}

module.exports = TopView;
