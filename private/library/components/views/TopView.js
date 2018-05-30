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

const elementCreator = require('../../ElementCreator');
const textTools = require('../../TextTools');
const labelHandler = require('../../labels/LabelHandler');
const accessCentral = require('../../AccessCentral');
const socketManager = require('../../SocketManager');

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

    if (showControls.alias) {
      const createAliasButton = elementCreator.createButton({
        text: 'Create alias',
      });

      items.push({ elements: [createAliasButton] });
    }

    if (items.concat(menuItems, lastItems).length > 0) {
      const menu = elementCreator.createContainer({
        classes: ['topMenu', 'hide'],
        elements: [
          elementCreator.createList({
            items: items.concat(menuItems, lastItems),
          }),
        ],
      });

      this.element.appendChild(elementCreator.createSpan({
        elementId: 'topMenuButton',
        text: labelHandler.getLabel({ baseObject: 'TopView', label: 'menu' }),
        clickFuncs: {
          leftFunc: () => {
            menu.classList.toggle('hide');
          },
        },
      }));
      this.element.appendChild(menu);
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
