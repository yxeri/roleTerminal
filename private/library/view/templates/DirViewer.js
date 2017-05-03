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
const DialogBox = require('../DialogBox');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');
const soundLibrary = require('../../audio/SoundLibrary');
const textTools = require('../../TextTools');

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

    this.element.setAttribute('id', 'dirViewer');
    this.viewer.classList.add('selectedView');
    this.selectedItem = null;

    this.populateList();
  }

  showDoc(docFile) {
    const docFragment = document.createDocumentFragment();
    docFragment.appendChild(elementCreator.createParagraph({ text: `${docFile.title}`, classes: ['title'] }));
    docFragment.appendChild(elementCreator.createParagraph({ text: `ID: ${docFile.docFileId.toUpperCase()}` }));
    docFragment.appendChild(elementCreator.createParagraph({ text: `Public: ${docFile.isPublic ? 'Yes' : 'No'}` }));
    docFragment.appendChild(elementCreator.createParagraph({ text: '------' }));

    docFile.text.forEach(line => docFragment.appendChild(elementCreator.createParagraph({ text: line })));

    this.viewer.classList.remove('flash');

    setTimeout(() => {
      this.viewer.innerHTML = '';
      this.viewer.classList.add('flash');
      this.viewer.scrollTop = this.viewer.scrollHeight;
      this.viewer.appendChild(docFragment);
    }, 100);
  }

  createDocFileButton(docFile) {
    const title = `${docFile.title || docFile.docFileId}`;
    const button = elementCreator.createButton({
      text: title.length > 30 ? `${title.slice(0, 20)} ... ${title.slice(title.length - 5, title.length)}` : title,
      func: () => {
        if (this.selectedItem) {
          this.selectedItem.classList.remove('selectedItem');
        }

        this.selectedItem = button.parentElement;
        this.selectedItem.classList.add('selectedItem');

        if (docFile.docFileId) {
          socketManager.emitEvent('getDocFile', { docFileId: docFile.docFileId }, ({ docFileError, data: docFileData }) => {
            if (docFileError) {
              console.log(docFileError);

              return;
            } else if (!docFileData.docFile) {
              const paragraph = elementCreator.createParagraph({ text: `${docFile.docFileId} - File not found` });

              this.viewer.innerHTML = '';
              this.viewer.appendChild(paragraph);
            }

            this.showDoc(docFileData.docFile);
          });
        } else {
          const deniedDialog = new DialogBox({
            buttons: {
              left: {
                text: 'Crack',
                eventFunc: () => {},
              },
              right: {
                text: 'Unlock',
                eventFunc: () => {
                  if (deniedDialog.markEmptyFields()) {
                    soundLibrary.playSound('fail');
                    deniedDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                    return;
                  }

                  const docFileId = deniedDialog.inputs.find(({ inputName }) => inputName === 'docFileId').inputElement.value;

                  socketManager.emitEvent('getDocFile', { docFileId }, ({ docFileError, data: docFileData }) => {
                    if (docFileError) {
                      console.log(docFileError);

                      return;
                    } else if (!docFileData.docFile) {
                      deniedDialog.changeExtraDescription({ text: ['Incorrect code', 'Access denied'] });
                    }

                    deniedDialog.removeView();
                    this.showDoc(docFileData.docFile);
                  });
                },
              },
            },
            description: ['Access denied. File is locked'],
            extraDescription: ['Please enter the file code to unlock it'],
            inputs: [{
              placeholder: 'File code',
              inputName: 'docFileId',
              isRequired: true,
            }],
          });

          deniedDialog.appendTo(this.element.parentElement);
        }
      },
    });

    return button;
  }

  populateList() {
    const systemList = new List({ shouldSort: false, title: 'SYSTEM' });
    const dirList = new List({ viewId: 'dirList', shouldSort: true, title: 'DIRECTORY' });
    const myFiles = new List({ viewId: 'myDir', shouldSort: true, title: 'My Files' });
    const myTeamFiles = new List({ viewId: 'myTeamDir', shouldSort: true, title: 'My Team' });
    const teamFiles = new List({ viewId: 'teamDir', shouldSort: true, title: 'TEAMS' });
    const userFiles = new List({ viewId: 'userDir', shouldSort: true, title: 'USERS' });
    // User name : List
    const userLists = {};
    // Team name : List
    const teamLists = {};

    const searchButton = elementCreator.createButton({
      text: 'ID search',
      func: () => {
        const idDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                idDialog.removeView();
              },
            },
            right: {
              text: 'Search',
              eventFunc: () => {
                const emptyFields = idDialog.markEmptyFields();

                if (emptyFields) {
                  soundLibrary.playSound('fail');
                  idDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                const documentId = idDialog.inputs.find(({ inputName }) => inputName === 'documentId').inputElement.value.toLowerCase();

                socketManager.emitEvent('getDocFile', { docFileId: documentId }, ({ error: docError, data: { docFile } }) => {
                  if (docError) {
                    console.log(docError);

                    return;
                  } else if (!docFile || docFile === null) {
                    idDialog.changeExtraDescription({ text: ['Unable to retrieve document with sent ID. Please try again'] });

                    return;
                  }

                  this.showDoc(docFile);
                  idDialog.removeView();
                });
              },
            },
          },
          inputs: [{
            placeholder: 'Document ID',
            inputName: 'documentId',
            isRequired: true,
          }],
          description: [
            'Retrieve a document from the archives',
          ],
          extraDescription: ['Enter the ID of the document'],
        });
        idDialog.appendTo(this.element.parentElement);
      },
    });
    const createButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create doc',
      func: () => {
        this.viewer.innerHTML = '';

        const docFragment = document.createDocumentFragment();
        const titleInput = elementCreator.createInput({ placeholder: 'Title', inputName: 'docTitle', isRequired: true });
        const idInput = elementCreator.createInput({ placeholder: 'Code to access the document with [a-z, 0-9]', inputName: 'docId', isRequired: true });
        const bodyInput = elementCreator.createInput({ placeholder: 'Text', inputName: 'docBody', isRequired: true, multiLine: true });
        const visibilitySet = elementCreator.createRadioSet({
          title: 'Who should be able to view the document? Those with the correct code will always be able to view the document.',
          optionName: 'visibility',
          options: [
            { optionId: 'visPublic', optionLabel: 'Everyone' },
            { optionId: 'visPrivate', optionLabel: 'Only those with the correct code' },
          ],
        });
        const teamSet = elementCreator.createRadioSet({
          title: 'Should the document be added to the team directory? Your team will be able to see and access the document without any code',
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
              const docId = textTools.trimSpace(idInput.value);

              if (!textTools.isInternationalAllowed(docId)) {
                idInput.classList.add('markedInput');
                idInput.setAttribute('placeholder', 'Has to be alphanumerical (a-z, 0-9)');
                idInput.value = '';

                return;
              }

              const teamYes = document.getElementById('teamYes');
              const docFile = {
                title: titleInput.value,
                docFileId: docId,
                text: bodyInput.value.split('\n'),
                isPublic: document.getElementById('visPublic').checked === true,
              };

              if (teamYes && teamYes.checked === true) {
                docFile.team = storageManager.getTeam();
              }

              socketManager.emitEvent('createDocFile', docFile, ({ error: docFileError }) => {
                if (docFileError) {
                  console.log(docFileError);

                  return;
                }

                this.viewer.innerHTML = '';
                this.viewer.appendChild(document.createTextNode('Document has been saved'));
                eventCentral.triggerEvent({ event: eventCentral.Events.CREATEDOCFILE, params: { docFile } });
              });
            }
          },
        }));
        docFragment.appendChild(buttons);

        this.viewer.appendChild(docFragment);
      },
    });

    systemList.addItems({ items: [searchButton, createButton] });
    dirList.addItems({ items: [teamFiles.element, userFiles.element] });

    this.itemList.appendChild(systemList.element);
    this.itemList.appendChild(myFiles.element);
    this.itemList.appendChild(myTeamFiles.element);
    this.itemList.appendChild(dirList.element);

    this.accessElements.push({
      element: createButton,
      accessLevel: 1,
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.DOCFILE,
      func: ({ docFile }) => {
        const userName = storageManager.getSelectedAlias() || storageManager.getUserName();
        const creator = docFile.creator;
        const docTeam = docFile.team;

        if (creator === userName) {
          myFiles.addItem({ item: this.createDocFileButton(docFile) });
        } else if (docTeam && docTeam !== '') {
          if (docTeam === storageManager.getTeam()) {
            myTeamFiles.addItem({ item: this.createDocFileButton(docFile) });
          } else {
            const list = teamLists[docTeam];

            if (!list) {
              teamLists[docTeam] = new List({
                elements: [this.createDocFileButton(docFile)],
                title: docTeam,
                shouldSort: true,
                showTitle: true,
                minimumToShow: 0,
              });
              userFiles.addItem({ item: teamLists[docTeam].element });
            } else {
              list.addItem({ item: this.createDocFileButton(docFile) });
            }
          }
        } else {
          const list = userLists[creator];

          if (!list) {
            userLists[creator] = new List({
              elements: [this.createDocFileButton(docFile)],
              title: creator,
              shouldSort: true,
              showTitle: true,
              minimumToShow: 0,
            });
            userFiles.addItem({ item: userLists[creator].element });
          } else {
            list.addItem({ item: this.createDocFileButton(docFile) });
          }
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.CREATEDOCFILE,
      func: ({ docFile }) => {
        myFiles.addItem({ item: this.createDocFileButton(docFile) });
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: ({ changedUser }) => {
        if (changedUser) {
          this.viewer.innerHTML = '';
          myFiles.replaceAllItems({ items: [] });
          myTeamFiles.replaceAllItems({ items: [] });
        }

        socketManager.emitEvent('getDocFilesList', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { myDocFiles = [], myTeamDocFiles = [], userDocFiles = [], teamDocFiles = [] } = data;
          const groupedUserDocs = {};
          const groupedTeamDocs = {};

          userDocFiles.forEach((docFile) => {
            if (!groupedUserDocs[docFile.creator]) {
              groupedUserDocs[docFile.creator] = [];
            }

            groupedUserDocs[docFile.creator].push(docFile);
          });
          teamDocFiles.forEach((docFile) => {
            if (!groupedTeamDocs[docFile.team]) {
              groupedTeamDocs[docFile.team] = [];
            }

            groupedTeamDocs[docFile.team].push(docFile);
          });

          myFiles.replaceAllItems({ items: myDocFiles.map(docFile => this.createDocFileButton(docFile)) });
          myTeamFiles.replaceAllItems({ items: myTeamDocFiles.map(docFile => this.createDocFileButton(docFile)) });
          userFiles.replaceAllItems({
            items: Object.keys(groupedUserDocs).map((userName) => {
              const docs = groupedUserDocs[userName];
              const list = new List({
                items: docs.map(docFile => this.createDocFileButton(docFile)),
                title: userName,
                shouldSort: true,
                showTitle: true,
                minimumToShow: 0,
              });

              userLists[userName] = list;

              return list.element;
            }),
          });
          teamFiles.replaceAllItems({
            items: Object.keys(groupedTeamDocs).map((teamName) => {
              const docs = groupedTeamDocs[teamName];
              const list = new List({
                items: docs.map(docFile => this.createDocFileButton(docFile)),
                title: teamName,
                shouldSort: true,
                showTitle: true,
                minimumToShow: 0,
              });

              teamLists[teamName] = list;

              return list.element;
            }),
          });
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
