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

const View = require('../base/View');
const DialogBox = require('../DialogBox');
const LoginBox = require('./LoginBox');
const storage = require('../../storage');

class MainMenu extends View {
  constructor({ socketManager, parentElement, keyHandler }) {
    super({ isFullscreen: false });
    this.element.setAttribute('id', 'mainMenu');
    this.element.classList.add('hide');

    const menu = document.createElement('UL');
    this.rows = [];

    const loginRow = document.createElement('LI');
    this.rows.push({ rowName: 'login', row: loginRow });
    loginRow.appendChild(document.createElement('BUTTON'));
    loginRow.lastChild.appendChild(document.createTextNode('Registera/Logga in'));
    loginRow.addEventListener('click', () => {
      new LoginBox({
        description: ['Endast för Krismyndigheten och Försvarsmakten'],
        extraDescription: ['Skriv in ert användarnamn och lösenord'],
        parentElement,
        socketManager,
        keyHandler,
      }).appendTo(parentElement);
    });
    this.accessElements.push({
      element: loginRow,
      accessLevel: 0,
      maxAccessLevel: 0,
    });

    const aliasRow = document.createElement('LI');
    this.rows.push({ rowName: 'alias', row: aliasRow });
    aliasRow.appendChild(document.createElement('BUTTON'));
    aliasRow.lastChild.appendChild(document.createTextNode('Skapa alias'));
    aliasRow.classList.add('hide');
    aliasRow.addEventListener('click', () => {
      const dialog = new DialogBox({
        buttons: {
          left: {
            text: 'Avbryt',
            eventFunc: () => {
              dialog.removeView();
            },
          },
          right: {
            text: 'Skapa',
            eventFunc: () => {
              if (!dialog.markEmptyFields()) {
                const alias = dialog.inputs.find(({ inputName }) => inputName === 'alias').inputElement.value;

                socketManager.emitEvent('addAlias', { alias }, ({ error }) => {
                  if (error) {
                    if (error.text) {
                      dialog.changeExtraDescription({ text: error.text });
                    }

                    return;
                  }

                  storage.addAlias(alias);
                  dialog.removeView();
                });
              }
            },
          },
        },
        description: [
          'Skriv in ett nytt alias. Ni kommer kunna välja att skicka meddelande med detta alias istället för ert användarnamn',
          'Skriv in ett av dina existerande alias om ni vill ändra det',
        ],
        parentElement,
        inputs: [{
          placeholder: 'Alias',
          inputName: 'alias',
          required: true,
        }],
        keyHandler,
      });
      dialog.appendTo(parentElement);
    });
    this.accessElements.push({
      element: aliasRow,
      accessLevel: 2,
    });

    const logoutRow = document.createElement('LI');
    this.rows.push({ rowName: 'logout', row: logoutRow });
    logoutRow.appendChild(document.createElement('BUTTON'));
    logoutRow.lastChild.appendChild(document.createTextNode('Logga ut'));
    logoutRow.classList.add('hide');
    logoutRow.addEventListener('click', () => {
      storage.removeUser();
      aliasRow.classList.add('hide');
      new LoginBox({
        description: ['Endast för Krismyndigheten och Försvarsmakten'],
        extraDescription: ['Skriv in ert användarnamn och lösenord'],
        parentElement,
        socketManager,
        keyHandler,
      }).appendTo(parentElement);
    });
    this.accessElements.push({
      element: logoutRow,
      accessLevel: 1,
    });

    menu.appendChild(loginRow);
    menu.appendChild(aliasRow);
    menu.appendChild(logoutRow);
    this.element.appendChild(menu);
  }
}

module.exports = MainMenu;
