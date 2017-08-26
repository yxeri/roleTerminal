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
const ButtonBox = require('../templates/ButtonBox');
const elementCreator = require('../../ElementCreator');
const socketManager = require('../../SocketManager');
const eventCentral = require('../../EventCentral');
const textTools = require('../../TextTools');
const soundLibrary = require('../../audio/SoundLibrary');
const storageManager = require('../../StorageManager');

class ToolsViewer extends StandardView {
  constructor({ isFullscreen }) {
    super({ isFullscreen, viewId: 'toolsViewer' });

    this.viewer.appendChild(elementCreator.createParagraph({ text: 'Rumours' }));
    this.viewer.appendChild(elementCreator.createList({}));
    this.viewer.classList.add('selectedView');

    this.codeList = new List({ shouldSort: false, title: 'CODES' });
    this.instructions = new List({ shouldSort: false, title: 'HELP', showingList: true });

    this.populateInstructions();
    this.populateList();

    this.itemList.appendChild(this.codeList.element);
    this.itemList.appendChild(this.instructions.element);

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: ({ changedUser }) => {
        if (changedUser) {
          this.codeList.replaceAllItems({ items: [] });
        }

        socketManager.emitEvent('getSimpleMessages', {}, ({ error, data }) => {
          if (error) {
            console.log(error);

            return;
          }

          const { simpleMsgs } = data;

          const fragment = document.createDocumentFragment();
          simpleMsgs.reverse().forEach((simpleMsg) => {
            fragment.appendChild(elementCreator.createListItem({
              element: elementCreator.createParagraph({ text: simpleMsg.text }) }));
          });

          this.viewer.lastElementChild.innerHTML = '';
          this.viewer.lastElementChild.appendChild(fragment);
        });

        if (storageManager.getToken()) {
          socketManager.emitEvent('getGameCodes', { codeType: 'loot', userName: storageManager.getUserName() }, ({ error, data }) => {
            if (error) {
              console.log(error);

              return;
            }

            const { gameCodes = [] } = data;

            this.codeList.replaceAllItems({ items: gameCodes.map(gameCode => elementCreator.createSpan({ text: gameCode.code })) });
          });
        }
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.SIMPLEMSG,
      func: ({ simpleMsg }) => {
        const listItem = elementCreator.createListItem({ element: elementCreator.createParagraph({ text: simpleMsg.text }) });

        this.addMessage(listItem);
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.GAMECODE,
      func: ({ gameCode }) => {
        if (gameCode.codeType !== 'loot') {
          return;
        } else if (gameCode.used) {
          this.codeList.removeItem({ name: gameCode.code });

          return;
        }

        this.codeList.addItem({ item: elementCreator.createSpan({ text: gameCode.code }) });
      },
    });
  }

  createInstructionButton(buttonText, instructionText) {
    return elementCreator.createButton({
      text: buttonText,
      func: () => {
        const instructionBox = new ButtonBox({
          description: instructionText,
          buttons: [elementCreator.createButton({
            text: 'Got it!',
            func: () => { instructionBox.removeView(); },
          })],
        });

        instructionBox.appendTo(this.element.parentElement);
      },
    });
  }

  populateInstructions() {
    const views = new List({
      title: 'Views',
      showTitle: true,
      shouldSort: true,
      items: [
        this.createInstructionButton('CHAT', [
          'CHAT allows you to receive/write messages to chat rooms or private messages to other users',
          'To the left you\'ll find: System, Following, Public, Users',
          'In System you can create new chat rooms. It will ask you for a name and an optional password. Leave the password field empty if you want the room to be public',
          'Following shows you all the rooms you are following. Clicking on any of them will switch you to that room.',
          'Public contains all rooms that you can join. Clicking on any of them will allow you to choose to start following it. Some may require you to type in a password',
          'User is a full list of all users. Click on one of them to start a private message chat with that user',
        ]),
        this.createInstructionButton('CREDS', [
          'CREDS handles the digital currency. On top you\'ll find your total amount of digital currency. Your transaction history will be shown below',
          'USERS contain all users. Clicking on any of them will allow you to send money to them',
        ]),
        this.createInstructionButton('LOGIN', [
          'LOGIN will give you the option to either login or register a new user',
          'You will be asked to repeat your password if you choose register',
        ]),
        this.createInstructionButton('LOGOUT', [
          'LOGOUT will log you out',
        ]),
        this.createInstructionButton('MAPS', [
          'MAPS show you a map of the world',
          'There are 4 types of map markers (all based on circles):',
          'a circle represents a static location (example: ApoCalypso), a vertical line represents you, a "T" represents a team member, two vertical lines represent another user and a cross is everything else',
          'Holding the mouse over a marker will show its name. Clicking on it will show its description',
          'The menu contains LOCAL, WORLD, USER, OTHER, ME.',
          'LOCAL are all the markers inside of the game area. WORLD are the markers outside of the game area. USER are all the users being tracked. OTHER are all other markers. ME is you',
          'Right clicking (or hold down your finger, if you are using a touch device) to get reveal a menu. The menu allows you to create a new marker or send a ping',
          'A ping is a bigger circle with one line of text. It can be used to indicate that something is happening in that area. Creating a new marker will add it to the map',
        ]),
        this.createInstructionButton('OSAT', [
          'OSAT is the text-based terminal. It contains ways to run missions and earn digital currency, hack LANTERNs and other stuff',
          'You will be shown programs that can be run by you',
          'You can either input the correct program name on the bottom or you can click on the program names',
          'Anything that has pink background can be clicked',
          'You will find more in-depth instructions for the programs under OSAT in this help menu',
        ]),
        this.createInstructionButton('PANIC', [
          'PANIC allows you to send a ping to the map, to notify others that you are under attack or that you found a threat',
          'A map ping is a bigger circle with one line of text, showing others that something is going in the area',
          'You will be given the option to choice Panzerwolves, Organica and Muggers. The only different between Panzerwolves and Organica is what will be shown with the ping on the map',
          'The mugger choice will only work if you are part of a team. That map ping will only be visible to the rest of your team',
        ]),
        this.createInstructionButton('YOU', [
          'YOU show you information about your user',
          'It contains your user name, the team you are part of and your device\'s ID (mostly used by game masters)',
          'There is also a key (6 numbers). This key is "lootable." It can be used by other players to steal some of your digital currency',
        ]),
        this.createInstructionButton('STORAGE', [
          'STORAGE contains documents written by players and/or organisers',
          'A document can be public or locked. To unlock a document you will need its ID',
          'Under SYSTEM you will find the option to create a document or get a document by its ID',
          'When you create a document, you will get the option to decide who will be able to access it',
          'DIRECTORY show you all public documents. Some documents (most from game masters) are not visible here and can only be access through "ID Search" in SYSTEM',
          'The DIRECTORY is sorted by teams and users. A greyed out button indicates that the document is locked. You will either need to enter its ID or crack it',
        ]),
        this.createInstructionButton('TEAM', [
          'TEAM show you information about your team. It also allows you create a team, if you are not already in one',
          'You will find the team creator under SYSTEM. If you are already in a team you will instead get the option to invite others to your team',
          'Members shows a list of all members of your team (only visible if you are in a team)',
        ]),
        this.createInstructionButton('TOOLS', [
          'TOOLS is the off-gamey area. There are instructions for all parts of the Oracle, "dassrykten" (rumours), lootable codes and aliases',
          'Rumours can be whatever you as a player feels is cool to share with others to create fun play',
          'Lootable codes are 6-digit and can be used by other players to steal some of your digital currency. You can generate them and write them down on whatever to allow others to loot it',
          'Aliases are your alter egos. You can switch between aliases in CHAT. That allows you to send messages from different user names',
        ]),
      ],
    });
    const osat = new List({
      title: 'OSAT',
      showTitle: true,
      shouldSort: true,
      items: [
        this.createInstructionButton('calibration Adjustment', [
          'calibrationAdjustment is an automated mission that you can run to gain some digital currency',
          'You will be assigned a verification code (8 digits) and a LANTERN. You will have to go to that LANTERN, enter your code and do whatever it says. You will be rewarded on completion',
        ]),
        this.createInstructionButton('hack Lantern', [
          'hackLantern allows you to increase or lower the amount of points a specific LANTERN gives to its owner',
          'You will be asked to choice which LANTERN you want to hack and if you want to boost (increase) or dampen (decrease) the amount of points',
          'You will be tasked with finding the correct password for a user. It will show you the name of the user, which password it is and a password hint',
          'You can either click on the passwords in the text dump or type it on the bottom. Holding the mouse over a word (or holding down a finger on the row for touch users) will highlight it',
          'Choosing an incorrect password will show you how many characters were in the correct position',
          '(Example: if the correct password is "game" and you choose "bane", it will show you that 2 characters were correct)',
          'You have a limited amount of tries. Failing a hack will lock you out of the chosen LANTERN for a while. You can still hack other LANTERNs',
        ]),
        this.createInstructionButton('creds Cracker', [
          'credsCracker is the program you use together with lootable codes',
          'It will ask you for a 6-digit code. Typing a correct one will steal digital currency from another player and add to your wallet',
        ]),
      ],
    });

    const items = [
      this.createInstructionButton('Start here', [
        'The first view you see is called "Home"',
        'If you click on any button in Home you\'ll switch to a new view',
        'To get back to Home you can either click on the top row or press alt+space',
        'The top row shows you if you are online/offline and current time',
        'Characters within [] indicates that you can press alt + that character instead of clicking the button (example: [P]ANIC. alt+P will open that view)',
        'Most views have a menu on the left side. The rows with an arrow indicated that you can click on them to expand/collapse them',
        'You will need to login to gain access to most features',
      ]),
      this.createInstructionButton('Home', ['']),
      views.element,
      osat.element,
    ];

    this.instructions.addItems({ items });
  }

  populateList() {
    const systemList = new List({
      title: 'SYSTEM',
      shouldSort: false,
    });

    const createAliasButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create alias',
      func: () => {
        const createDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                createDialog.removeView();
              },
            },
            right: {
              text: 'Create',
              eventFunc: () => {
                const emptyFields = createDialog.markEmptyFields();

                if (emptyFields) {
                  soundLibrary.playSound('fail');
                  createDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                const alias = createDialog.inputs.find(({ inputName }) => inputName === 'alias').inputElement.value.toLowerCase();

                socketManager.emitEvent('createAlias', { alias, user: { userName: storageManager.getUserName() } }, ({ error: createError }) => {
                  if (createError) {
                    console.log(createError);

                    if (createError.type === 'already exists') {
                      createDialog.changeExtraDescription({ text: ['Alias already exists'] });

                      return;
                    }

                    createDialog.changeExtraDescription({ text: ['Something went wrong.', 'Unable to create alias'] });

                    return;
                  }

                  storageManager.addAlias(alias);
                  eventCentral.triggerEvent({
                    event: eventCentral.Events.NEWALIAS,
                    params: { alias },
                  });
                  createDialog.removeView();
                });
              },
            },
          },
          inputs: [{
            placeholder: 'Alias',
            inputName: 'alias',
            isRequired: true,
            maxLength: 10,
          }],
          description: [
            'Alter Ego Creator 0.1.2 Razor Edition',
            textTools.createMixedString(25),
            'You created alias will be available in CHAT and FILES.',
            'NOTE! No one, except you, will be able to create or use this alias.',
            'Create a FILES alias if you want all your team members to be able to create and use aliases with the same name',
          ],
          extraDescription: ['Enter your new alias'],
        });
        createDialog.appendTo(this.element.parentElement);
      },
    });
    const createCreatorAliasButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create FILES alias',
      func: () => {
        const createDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                createDialog.removeView();
              },
            },
            right: {
              text: 'Create',
              eventFunc: () => {
                const emptyFields = createDialog.markEmptyFields();

                if (emptyFields) {
                  soundLibrary.playSound('fail');
                  createDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                const alias = createDialog.inputs.find(({ inputName }) => inputName === 'alias').inputElement.value.toLowerCase();

                socketManager.emitEvent('addCreatorAlias', { alias, userName: storageManager.getUserName() }, ({ error: createError }) => {
                  if (createError) {
                    console.log(createError);

                    if (createError.type === 'already exists') {
                      createDialog.changeExtraDescription({ text: ['Alias already exists'] });

                      return;
                    }

                    createDialog.changeExtraDescription({ text: ['Something went wrong.', 'Unable to create alias'] });

                    return;
                  }

                  storageManager.addCreatorAlias(alias);
                  eventCentral.triggerEvent({
                    event: eventCentral.Events.NEWCREATORALIAS,
                    params: { alias },
                  });
                  createDialog.removeView();
                });
              },
            },
          },
          inputs: [{
            placeholder: 'Alias',
            inputName: 'alias',
            isRequired: true,
            maxLength: 10,
          }],
          description: [
            'File Custom Creator 0.0.2 Razor Edition',
            textTools.createMixedString(25),
            'Your created alias will be available in FILES.',
            'All your team members can create and use the same alias',
            'This alias cannot be used in the CHAT',
          ],
          extraDescription: ['Enter your new alias'],
        });
        createDialog.appendTo(this.element.parentElement);
      },
    });
    const createSimpleMsgButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create rumour',
      func: () => {
        const createDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                createDialog.removeView();
              },
            },
            right: {
              text: 'Create',
              eventFunc: () => {
                const emptyFields = createDialog.markEmptyFields();

                if (emptyFields) {
                  soundLibrary.playSound('fail');
                  createDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                const text = createDialog.inputs.find(({ inputName }) => inputName === 'simpleText').inputElement.value;

                socketManager.emitEvent('simpleMsg', { text }, ({ error: createError, data }) => {
                  if (createError) {
                    console.log(createError);

                    return;
                  }

                  const { simpleMsg } = data;

                  eventCentral.triggerEvent({
                    event: eventCentral.Events.SIMPLEMSG,
                    params: { simpleMsg },
                  });
                  createDialog.removeView();
                });
              },
            },
          },
          inputs: [{
            placeholder: 'Text',
            inputName: 'simpleText',
            isRequired: true,
            multiLine: true,
          }],
          description: [
            'Dassrykten IoT Edition',
            textTools.createMixedString(25),
            'Create a rumour that is visible for all other players',
            'It will be shown in the view to the right',
          ],
          extraDescription: ['Enter the message'],
        });
        createDialog.appendTo(this.element.parentElement);
      },
    });
    const createGameCodeButton = elementCreator.createButton({
      classes: ['hide'],
      text: 'Create loot code',
      func: () => {
        const createDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                createDialog.removeView();
              },
            },
            right: {
              text: 'Create',
              eventFunc: () => {
                const emptyFields = createDialog.markEmptyFields();

                if (emptyFields) {
                  soundLibrary.playSound('fail');
                  createDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                  return;
                }

                socketManager.emitEvent('createGameCode', { codeType: 'loot', owner: storageManager.getUserName() }, ({ error: createError, data }) => {
                  if (createError) {
                    console.log(createError);

                    return;
                  }

                  eventCentral.triggerEvent({ event: eventCentral.Events.GAMECODE, params: { gameCode: data.gameCode } });
                  createDialog.removeView();

                  const gameCodeBox = new ButtonBox({
                    description: [
                      `Your new code is: ${data.gameCode.code}`,
                      'All unused codes are also listed to the left, under CODES',
                    ],
                    buttons: [elementCreator.createButton({
                      text: 'Noted',
                      func: () => { gameCodeBox.removeView(); },
                    })],
                  });

                  gameCodeBox.appendTo(this.element.parentElement);
                });
              },
            },
          },
          description: ['Create a loot code. The loot code can be used by another player to steal some of your credits'],
        });

        createDialog.appendTo(this.element.parentElement);
      },
    });
    const setCoordinatesButton = elementCreator.createButton({
      text: 'Set static coordinates',
      func: () => {
        const staticPosition = storageManager.getStaticPosition();

        const setDialog = new DialogBox({
          buttons: {
            left: {
              text: 'Cancel',
              eventFunc: () => {
                setDialog.removeView();
              },
            },
            right: {
              text: 'Set',
              eventFunc: () => {
                const latitude = setDialog.inputs.find(({ inputName }) => inputName === 'latitude').inputElement.value;
                const longitude = setDialog.inputs.find(({ inputName }) => inputName === 'longitude').inputElement.value;

                if (latitude === '' && longitude === '') {
                  storageManager.removeStaticPosition();
                  setDialog.removeView();
                } else if (!isNaN(latitude) && !isNaN(longitude)) {
                  storageManager.setStaticPosition({ latitude: parseFloat(latitude), longitude: parseFloat(longitude), accuracy: 30 });
                  setDialog.removeView();
                } else {
                  setDialog.clearInput('latitude');
                  setDialog.clearInput('longitude');
                  setDialog.focusInput('latitude');
                  setDialog.changeExtraDescription({ text: ['Latitude and Longitude has to be numbers. Leave them empty if you want to remove your static position'] });
                }
              },
            },
          },
          inputs: [{
            placeholder: 'Latitude',
            inputName: 'latitude',
            maxLength: 30,
            defaultValue: staticPosition ? staticPosition.coordinates.latitude : '',
          }, {
            placeholder: 'Longitude',
            inputName: 'longitude',
            maxLength: 30,
            defaultValue: staticPosition ? staticPosition.coordinates.longitude : '',
          }],
          description: [
            'Coordinates Spoofer 5.1.1 Razor Edition',
            textTools.createMixedString(25),
            'Set static GPS coordinates. Leave both fields empty if you want to remove the static coordinates',
          ],
        });
        setDialog.appendTo(this.element.parentElement);
      },
    });

    systemList.addItems({ items: [createSimpleMsgButton, createGameCodeButton, createAliasButton, createCreatorAliasButton, setCoordinatesButton] });
    this.itemList.appendChild(systemList.element);

    this.accessElements.push({
      element: createSimpleMsgButton,
      accessLevel: 1,
    });
    this.accessElements.push({
      element: createAliasButton,
      accessLevel: 1,
    });
    this.accessElements.push({
      element: createCreatorAliasButton,
      accessLevel: 1,
    });
    this.accessElements.push({
      element: createGameCodeButton,
      accessLevel: 1,
    });
  }

  addMessage(messageItem) {
    this.viewer.lastElementChild.insertBefore(messageItem, this.viewer.lastElementChild.firstElementChild);
  }
}

module.exports = ToolsViewer;
