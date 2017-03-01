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
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');

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
    this.docsSelect = elementCreator.createContainer({});
    this.viewer = elementCreator.createContainer({});

    this.element.appendChild(this.docsSelect);
    this.element.appendChild(this.viewer);
  }

  appendArchives(archives = []) {
    return archives.map((archive) => { // eslint-disable-line arrow-body-style
      return elementCreator.createButton({
        func: () => {
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

            this.viewer.innerHTML = '';
            this.viewer.appendChild(docFragment);
          });
        },
        text: `${archive.title || archive.archiveId}`,
      });
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
          const idInput = elementCreator.createInput({ placeholder: 'Unique ID to access the document with', inputName: 'docId', isRequired: true });
          const bodyInput = elementCreator.createInput({ placeholder: 'Text', inputName: 'docBody', isRequired: true, multiLine: true });
          const visibilitySet = elementCreator.createRadioSet({
            title: 'Who should be able to view the document? Those with the correct document ID will always be able to view the document.',
            optionName: 'visibility',
            options: [
              { optionId: 'visPublic', optionLabel: 'Everyone' },
              { optionId: 'visTeam', optionLabel: 'My team' },
              { optionId: 'visPrivate', optionLabel: 'Only those with the correct ID' },
            ],
          });

          // TODO Duplicate code in Messenger
          bodyInput.addEventListener('input', () => {
            bodyInput.style.height = 'auto';
            bodyInput.style.height = `${bodyInput.scrollHeight}px`;
          });

          docFragment.appendChild(titleInput);
          docFragment.appendChild(idInput);
          docFragment.appendChild(bodyInput);
          docFragment.appendChild(visibilitySet);
          docFragment.appendChild(elementCreator.createButton({
            text: 'Save',
            func: () => {
              if (!markEmptyFields([titleInput, bodyInput])) {
                const archive = {
                  title: titleInput.value,
                  archiveId: idInput.value,
                  text: bodyInput.value.split('\n'),
                  isPublic: document.getElementById('visPublic').checked === true,
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

          this.viewer.appendChild(docFragment);
        },
      }));

      if (data.userArchives.length) {
        listFragment.appendChild(elementCreator.createParagraph({ text: 'Yours', classes: ['center'] }));
        listFragment.appendChild(elementCreator.createList({ elements: this.appendArchives(data.userArchives) }));
      }

      listFragment.appendChild(elementCreator.createParagraph({ text: 'Public', classes: ['center'] }));
      listFragment.appendChild(elementCreator.createList({ elements: this.appendArchives(data.archives) }));

      this.docsSelect.appendChild(listFragment);
    });
  }

  appendTo(parentElement) {
    this.populateList();
    super.appendTo(parentElement);
  }
}

module.exports = DocsViewer;
