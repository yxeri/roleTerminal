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

const List = require('../base/List');
const StandardView = require('../base/StandardView');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');

// TODO Duplicate code in DialogBox
/**
 * Mark empty fields. Returns true if one of them were empty
 * @param {HTMLInputElement[]} inputs - Inputs to check
 * @returns {boolean} Is one of the fields empty?
 */
function markEmptyFields(inputs) {
  let emptyFields = false;

  inputs.forEach((input) => {
    if (input.value === '') {
      emptyFields = true;
      input.classList.add('markedInput');
    }
  });

  return emptyFields;
}

class DocsViewer extends StandardView {
  constructor({ isFullscreen }) {
    super({ isFullscreen });

    this.element.setAttribute('id', 'docsViewer');
    this.viewer.classList.add('selectedView');
    this.selectedItem = null;

    this.populateList();
  }

  createArchiveButton(archive) {
    const title = `${archive.title || archive.archiveId}`;
    const button = elementCreator.createButton({
      text: title.length > 30 ? `${title.slice(0, 20)} ... ${title.slice(title.length - 5, title.length)}` : title,
      func: () => {
        if (this.selectedItem) {
          this.selectedItem.classList.remove('selectedItem');
        }

        this.selectedItem = button.parentElement;
        this.selectedItem.classList.add('selectedItem');

        socketManager.emitEvent('getArchive', { archiveId: archive.archiveId }, ({ archiveError, data: archiveData }) => {
          if (archiveError) {
            console.log(archiveError);

            return;
          }

          const docFragment = document.createDocumentFragment();
          docFragment.appendChild(elementCreator.createParagraph({ text: `${archiveData.archive.title}`, classes: ['title'] }));
          docFragment.appendChild(elementCreator.createParagraph({ text: `ID: ${archiveData.archive.archiveId.toUpperCase()}` }));
          docFragment.appendChild(elementCreator.createParagraph({ text: `Public: ${archiveData.archive.isPublic ? 'Yes' : 'No'}` }));

          archiveData.archive.text.forEach(line => docFragment.appendChild(elementCreator.createParagraph({ text: line })));

          this.viewer.classList.remove('flash');

          setTimeout(() => {
            this.viewer.innerHTML = '';
            this.viewer.classList.add('flash');
            this.viewer.scrollTop = this.viewer.scrollHeight;
            this.viewer.appendChild(docFragment);
          }, 100);
        });
      },
    });

    return button;
  }

  populateList() {
    const systemList = new List({ shouldSort: false, title: 'SYSTEM' });
    const userDocs = new List({ viewId: 'userDocuments', shouldSort: true, title: 'Yours' });
    const publicDocs = new List({ viewId: 'publicDocuments', shouldSort: true, title: 'Public' });

    const createButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create doc',
      func: () => {
        this.viewer.innerHTML = '';

        const docFragment = document.createDocumentFragment();
        const titleInput = elementCreator.createInput({ placeholder: 'Title', inputName: 'docTitle', isRequired: true });
        const idInput = elementCreator.createInput({ placeholder: 'ID to access the document with', inputName: 'docId', isRequired: true });
        const bodyInput = elementCreator.createInput({ placeholder: 'Text', inputName: 'docBody', isRequired: true, multiLine: true });
        const visibilitySet = elementCreator.createRadioSet({
          title: 'Who should be able to view the document? Those with the correct document ID will always be able to view the document.',
          optionName: 'visibility',
          options: [
            { optionId: 'visPublic', optionLabel: 'Everyone' },
            { optionId: 'visPrivate', optionLabel: 'Only those with the correct ID' },
          ],
        });
        const teamSet = elementCreator.createRadioSet({
          title: 'Should the document be added to the team directory?',
          optionName: 'team',
          options: [
            { optionId: 'teamYes', optionLabel: 'Yes' },
            { optionId: 'teamNo', optionLabel: 'No' },
          ],
        });
        const buttons = elementCreator.createContainer({ classes: ['buttons'] });

        // TODO Duplicate code in Messenger
        bodyInput.addEventListener('input', () => {
          bodyInput.style.height = 'auto';
          bodyInput.style.height = `${bodyInput.scrollHeight}px`;
        });

        docFragment.appendChild(titleInput);
        docFragment.appendChild(idInput);
        docFragment.appendChild(bodyInput);
        docFragment.appendChild(visibilitySet);

        if (storageManager.getTeam()) { docFragment.appendChild(teamSet); }

        buttons.appendChild(elementCreator.createButton({
          text: 'Save',
          func: () => {
            if (!markEmptyFields([titleInput, bodyInput, idInput])) {
              const archive = {
                title: titleInput.value,
                archiveId: idInput.value,
                text: bodyInput.value.split('\n'),
                isPublic: document.getElementById('visPublic').checked === true,
                teamDir: storageManager.getTeam() && document.getElementById('teamYes').checked === true,
              };

              socketManager.emitEvent('createArchive', archive, ({ error: archiveError }) => {
                if (archiveError) {
                  console.log(archiveError);

                  return;
                }

                this.viewer.innerHTML = '';
                this.viewer.appendChild(document.createTextNode('Document has been saved'));
              });
            }
          },
        }));
        docFragment.appendChild(buttons);

        this.viewer.appendChild(docFragment);
      },
    });
    systemList.addItem({ item: createButton });

    this.itemList.appendChild(systemList.element);
    this.itemList.appendChild(userDocs.element);
    this.itemList.appendChild(publicDocs.element);

    this.accessElements.push({
      element: createButton,
      accessLevel: 1,
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        this.viewer.innerHTML = '';

        socketManager.emitEvent('getArchivesList', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { userArchives = [], archives = [] } = data;

          userDocs.replaceAllItems({ items: userArchives.map(archive => this.createArchiveButton(archive)) });
          publicDocs.replaceAllItems({ items: archives.map(archive => this.createArchiveButton(archive)) });
        });
      },
    });
  }

  removeView() {
    super.removeView();
    this.viewer.classList.remove('flash');
  }
}

module.exports = DocsViewer;
