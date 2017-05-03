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
const ButtonBox = require('./ButtonBox');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');
const eventCentral = require('../../EventCentral');
const textTools = require('../../TextTools');
const soundLibrary = require('../../audio/SoundLibrary');

class TeamViewer extends StandardView {
  constructor({ isFullscreen, worldMap }) {
    super({ isFullscreen, viewId: 'teamViewer' });

    this.worldMap = worldMap;
    this.viewer.classList.add('selectedView');
    this.selectedItem = null;

    this.populateList();
  }

  populateList() {
    const systemList = new List({ shouldSort: false, title: 'SYSTEM' });
    const userList = new List({ viewId: 'teamUsers', shouldSort: true, title: 'Members' });
    const userViewerList = new List({ viewId: 'teamViewerUsers', shouldSort: false, title: 'Members' });

    const createButton = elementCreator.createButton({
      text: 'Create team',
      func: () => {
        const createDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => { createDialog.removeView(); },
            },
            right: {
              text: 'Create',
              eventFunc: () => {
                if (createDialog.markEmptyFields()) {
                  soundLibrary.playSound('fail');
                  createDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                const team = {
                  teamName: createDialog.inputs.find(input => input.inputName === 'teamName').inputElement.value,
                  shortName: createDialog.inputs.find(input => input.inputName === 'shortName').inputElement.value.toUpperCase(),
                };

                socketManager.emitEvent('createTeam', { team }, ({ error, data }) => {
                  if (error) {
                    console.log(error);

                    return;
                  }

                  createDialog.removeView();

                  if (data.requiresVerify) {
                    const verifyDialog = new ButtonBox({
                      description: [
                        'Your team needs to be verified before you can access it',
                        'Contact an administrator',
                      ],
                      buttons: [
                        elementCreator.createButton({
                          text: 'Understood',
                          func: () => { verifyDialog.removeView(); },
                        }),
                      ],
                    });

                    verifyDialog.appendTo(this.element.parentElement);
                  }
                });
              },
            },
          },
          inputs: [{
            placeholder: 'Team name',
            inputName: 'teamName',
            isRequired: true,
            maxLength: 30,
          }, {
            placeholder: 'Short name/Acronym',
            inputName: 'shortName',
            isRequired: true,
            maxLength: 4,
          }],
          description: ['Create a team'],
          extraDescription: ['Input full and short name. Short name will be capitalized'],
        });
        createDialog.appendTo(this.element.parentElement);
      },
    });
    const inviteButton = elementCreator.createButton({
      text: 'Invite user',
      func: () => {

      },
    });

    systemList.addItems({ items: [createButton, inviteButton] });

    // system: Create
    // If team: Invite

    this.viewer.appendChild(userViewerList.element);
    this.itemList.appendChild(systemList.element);
    this.itemList.appendChild(userList.element);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: ({ changedUser }) => {
        if (changedUser) {
          this.viewer.innerHTML = '';
          userList.replaceAllItems({ items: [] });
          userViewerList.replaceAllItems({ items: [] });
        }

        if (storageManager.getTeam()) {
          createButton.classList.add('hide');
          inviteButton.classList.remove('hide');
        } else {
          createButton.classList.remove('hide');
          inviteButton.classList.add('hide');
        }

        socketManager.emitEvent('getTeamMembers', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { users = [] } = data;
          const userNames = users.map(user => user.userName);

          userList.replaceAllItems({
            items: userNames.map((userName) => {
              return elementCreator.createButton({
                text: userName,
                func: () => {
                  // Dialog with options to kick, promote (maybe?)
                },
              });
            }),
          });

          if (this.worldMap) {
            const teamPings = Object.keys(this.worldMap.markers).filter((positionName) => {
              const marker = this.worldMap.markers[positionName];

              return marker.markerType === 'ping' && userNames.indexOf(marker.owner) > -1;
            });
            const listItems = teamPings.map((ping) => {
              const beautifiedDate = textTools.generateTimeStamp({ date: ping.lastUpdated });

              return elementCreator.createSpan({ text: `${beautifiedDate.fullDate} ${beautifiedDate.fullTime} ${ping.positionName}` });
            });

            userViewerList.replaceAllItems({ items: listItems });
          }
        });
      },
    });
  }
}

module.exports = TeamViewer;
