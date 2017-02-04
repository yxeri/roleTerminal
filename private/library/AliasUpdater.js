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

const storageManager = require('./StorageManager');

class AliasUpdater {
  constructor() {
    this.lists = [];
  }

  /**
   * Add list containing user aliases that should be updated when aliases change
   * @param {HTMLUListElement} aliasList - List containing user aliases
   * @param {HTMLButtonElement} button - Button that triggers the reveal of the list
   */
  addAliasList(aliasList, button) { this.lists.push({ aliasList, button }); }

  addAlias(alias) { this.updateAliasLists(storageManager.getAliases().concat[alias]); }

  /**
   * Triggers toggleAccessElements on all views and reveals/hides elements based on the user's access level
   * @param {string[]|null} aliases - User aliases
   */
  updateAliasLists(aliases = []) {
    this.lists.forEach((list) => {
      if (aliases.length > 0) {
        const fragment = document.createDocumentFragment();
        const fullAliasList = [storageManager.getUserName()].concat(aliases);

        fullAliasList.forEach((alias) => {
          const row = document.createElement('LI');
          const button = document.createElement('BUTTON');
          button.appendChild(document.createTextNode(alias));
          button.addEventListener('click', () => {
            if (storageManager.getUserName() !== alias) {
              storageManager.setSelectedAlias(alias);
            } else {
              storageManager.removeSelectedAlias();
            }

            list.button.replaceChild(document.createTextNode(`Alias: ${alias}`), list.button.firstChild);
            list.aliasList.classList.toggle('hide');
          });

          row.appendChild(button);
          fragment.appendChild(row);
        });

        list.aliasList.innerHTML = ' '; // eslint-disable-line no-param-reassign
        list.aliasList.appendChild(fragment);

        const chosenName = `Alias: ${storageManager.getSelectedAlias() || storageManager.getUserName() || ''}`;

        if (list.button.firstChild) {
          list.button.replaceChild(document.createTextNode(chosenName), list.button.firstChild);
        } else {
          list.button.appendChild(document.createTextNode(chosenName));
        }
      } else {
        list.button.classList.add('hide');
      }
    });
  }
}

const aliasUpdater = new AliasUpdater();

module.exports = aliasUpdater;
