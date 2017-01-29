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

const storage = require('./storage');

const aliasLists = [];

/**
 * Add list containing user aliases that should be updated when aliases change
 * @param {HTMLUListElement} aliasList - List containing user aliases
 * @param {HTMLButtonElement} button - Button that triggers the reveal of the list
 */
function addAliasList(aliasList, button) {
  aliasLists.push({ aliasList, button });
}

/**
 * Triggers toggleAccessElements on all views and reveals/hides elements based on the user's access level
 * @param {string[]|null} aliases - User aliases
 */
function updateAliasLists(aliases) {
  console.log('aliases', aliases, 'aliasesLists', aliasLists);

  aliasLists.forEach((list) => {
    if (aliases) {
      const fragment = document.createDocumentFragment();
      const fullAliasList = [storage.getUserName()].concat(aliases);

      fullAliasList.forEach((alias) => {
        const row = document.createElement('LI');
        const button = document.createElement('BUTTON');
        button.appendChild(document.createTextNode(alias));
        button.addEventListener('click', () => {
          if (storage.getUserName() !== alias) {
            storage.setSelectedAlias(alias);
          } else {
            storage.removeSelectedAlias();
          }

          list.button.replaceChild(document.createTextNode(`Alias: ${alias}`), list.button.firstChild);
          list.aliasList.classList.toggle('hide');
        });

        row.appendChild(button);
        fragment.appendChild(row);
      });

      list.aliasList.innerHTML = ' ';
      list.aliasList.appendChild(fragment);

      const chosenName = `Alias: ${storage.getSelectedAlias() || storage.getUserName() || ''}`;

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

exports.addAliasList = addAliasList;
exports.updateAliasLists = updateAliasLists;
