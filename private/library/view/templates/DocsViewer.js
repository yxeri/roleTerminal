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
const List = require('../base/List');
const Viewer = require('../base/Viewer');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');

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

class DocsViewer extends View {
  constructor({ isFullscreen }) {
    super({ isFullscreen });

    this.element.setAttribute('id', 'docsViewer');
    const container = elementCreator.createContainer({ classes: ['viewContainer'] });
    this.docsSelect = elementCreator.createContainer({ classes: ['list'] });
    this.viewer = new Viewer({}).element;
    this.selectedItem = null;

    container.appendChild(this.docsSelect);
    container.appendChild(this.viewer);
    this.element.appendChild(container);
  }

  appendArchives(archives = []) {
    return archives.map((archive) => { // eslint-disable-line arrow-body-style
      const button = elementCreator.createButton({
        func: () => {
          if (this.selectedItem) {
            this.selectedItem.classList.remove('selectedItem');
          }

          this.viewer.classList.add('selectedView');
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
        text: `${archive.title || archive.archiveId}`,
      });

      return button;
    });
  }

  populateList() {
    this.docsSelect.innerHTML = '';

    socketManager.emitEvent('getArchivesList', {}, ({ error, data }) => {
      if (error) {
        console.log(error);

        return;
      }

      const listFragment = document.createDocumentFragment();

      listFragment.appendChild(elementCreator.createButton({
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
              if (!markEmptyFields([titleInput, bodyInput])) {
                const archive = {
                  title: titleInput.value,
                  archiveId: idInput.value,
                  text: bodyInput.value.split('\n'),
                  isPublic: document.getElementById('visPublic').checked === true,
                  teamDir: storageManager.getTeam() && document.getElementById('teamYes').checked === true,
                };

                socketManager.emitEvent('createArchive', archive, ({ archiveError }) => {
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
      }));

      if (data.userArchives.length) {
        listFragment.appendChild(new List({ viewId: 'userDocuments', listItems: this.appendArchives(data.userArchives), shouldSort: true, title: 'Yours' }).element);
      }

      if (storageManager.getTeam()) {
        listFragment.appendChild(new List({ viewId: 'teamDocuments', listItems: this.appendArchives(data.userArchives), shouldSort: true, title: 'Team' }).element);
      }

      listFragment.appendChild(new List({ viewId: 'publicDocuments', listItems: this.appendArchives(data.archives), shouldSort: true, title: 'Public' }).element);

      this.docsSelect.appendChild(listFragment);
    });
  }

  removeView() {
    this.viewer.classList.remove('flash');
    super.removeView();
  }
}

module.exports = DocsViewer;
