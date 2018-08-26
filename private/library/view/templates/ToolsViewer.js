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
    const topics = new List({
      title: 'Topics',
      showTitle: true,
      shouldSort: true,
      items: [
        this.createInstructionButton('Dyslexia?', [
          'There is an option to switch to a font that has been created specifically for those with dyslexia. All you have to do is to add /?dyslexic=true to the site address. Example: https://bbrterminal.thethirdgift.com/?dyslexic=true.',
          'NOTE! Don\'t mess around with the address on public terminals.',
        ]),
        this.createInstructionButton('Moving between views', [
          'You can always click on the top row (with the time and wrecking buttons) to go back to HOME',
          'HOME is the main view you go to. This current view is called SUPPORT.',
        ]),
        this.createInstructionButton('Registering and logging in', [
          'LOGIN will give you the option to register a new user and/or login.',
          'Fill in your user name and password. Clicking on Register will show three new fields. The first one asks you to repeat your password. The two last ones asks you to input a valid e-mail address',
          'The e-mail is used to send you a verification mail, so that you can activate your account. It is also used when you want to reset your password',
          'Already got a registered and verified user? Just fill in the user name, password and click on login. Tada! You are now a terminal user.',
        ]),
        this.createInstructionButton('Logging out', [
          'LOGOUT will log you out. It is IMPORTANT that you remember to do so on public terminals',
        ]),
        this.createInstructionButton('Your information', [
          'YOU show you information about your user',
          'It contains your user name, the team you are part of and your device\'s ID (mostly used by game masters)',
          'There is also a key (6 numbers). This key is "lootable." It can be used by other players to steal some of your digital currency',
        ]),
        this.createInstructionButton('Sending messages', [
          'CHAT allows you to receive/write messages to chat rooms or private messages to other users',
          'On the bottom is the field where you can enter your message. Enter adds line breaks. To send a message you have to either click send or keyboard shortcut alt+enter.',
          'The default room that appears when you go to CHAT is PUBLIC. PUBLIC is open and followed by all users',
        ]),
        this.createInstructionButton('Joining rooms', [
          'To the left in CHAT you will find FOLLOWING and PUBLIC. The list under FOLLOWING shows you all the rooms you are in. They will change background color if a message is sent to them by another user.',
          'PUBLIC contains all the rooms that in the system. You can click on any of them to join the room. The ones with greyed out buttons are protected with a password. You will have to find it somehow, maybe through lots of torturing?',
          'You can unfollow any room by right-clicking or holding down your finger on the room you want to leave.',
        ]),
        this.createInstructionButton('Sending private messages', [
          'To the left in CHAT you will find USERS. Clicking on any of them will create a separate room containing your and their name (example: "you <-> they"), where you can send private messages to that user',
        ]),
        this.createInstructionButton('Sending virtual caps', [
          'WALLET handles the digital currency. On top you\'ll find your total amount of digital currency. Your transaction history will be shown below',
          'USERS contain all users and TEAMS all teams. Clicking on any of them will allow you to send money to them.',
        ]),
        this.createInstructionButton('Using the map', [
          'MAPS show you a map of the world',
          'There are 4 types of map markers (all based on circles):',
          'a circle represents a static location (example: ApoCalypso), a vertical line represents you, a "T" represents a team member, two vertical lines represent another user and a cross is everything else',
          'Holding the mouse over a marker will show its name. Clicking on it will show its description',
          'The menu contains LOCAL, WORLD, USER, ME.',
          'LOCAL are all the markers inside of the game area. WORLD are the markers outside of the game area. USER are all the users being tracked. ME is you',
          'A ping is a bigger circle with one line of text. It can be used to indicate that something is happening in that area. Creating a new marker will add it to the map',
        ]),
        this.createInstructionButton('PANIC!', [
          'PANIC allows you to send a ping to the map, indicating an panzerwolf/Organica threat. You can notify others that you are being mordered or that you are already bleeding out on the ground',
          'Those who are part of a team can use the last option to send a ping that is only visible to other team members.',
        ]),
        this.createInstructionButton('Wrecking info', [
          'In the top row is a button called WRECKING. Clicking on it will show you current information on the LANTERNs, wreckers and time left/time until the next round',
          'Each LANTERN has a name, owner and signal value. The signal value is the amount of points the owner gets each tick and can be affected by hacking the LANTERN.',
          'A LANTERN will change background color if it is under attack and is in the progress of changing owner.',
        ]),
        this.createInstructionButton('Hacking LANTERN', [
          'In TOOLS you will find a command called "hackLantern" Clicking on it will start you on your way to hacking a lantern',
          'The first thing you will be asked is to choose a LANTERN. The owner of each LANTERN is showed to the right. It will also show "UNDER ATTACK" if the LANTERN is currently in the progress of changing owner.',
          'After choosing a LANTERN you will be asked if you want to Amplify or Dampen it. Amplifying the signal means that the amount of points given to the owner of the LANTERN increases per tick.',
          'Next step is you looking through a dump of text. The text contains one correct password and several incorrect ones. On the bottom. you will find a password hint, that tells you a correct character in a correct position',
          'You have to use this hint and try to find the password. You have up to three tries. Each incorrect try will show you how many characters were in the correct position from the word you chose. It gives further hints to the correct password.',
          'You will also notice a user name. You can write this down together with the password to sell off to others or make your own hacking attempts easier in the future (just have to resuse what you wrote down!). NOTE! Users can have more than one password, so always keep an eye on the password hint.',
          'Done! Your affect on the LANTERN should be visible in the LANTERN info window.',
        ]),
        this.createInstructionButton('Unlocking and documents', [
          'You may find strange codes in the wasteland. In FILES you will find ways to both create and read documents. Under SYSTEM, you will find ID SEARCH. You can use that to insert a code you found and unlock a document!',
          'You will also notice that there is a list called DIRECTORY. The DIRECTORY contains all other documents sorted by either team or user name. Clicking on any will open it up. The ones that are greyed out require the correct ID/code to unlock. The rest are open to the public, including you!',
        ]),
        this.createInstructionButton('Creating documents', [
          'You can create your own documents in FILES, under SYSTEM.',
          'A document consists of a title (that has to be unique), an ID/code (that has to be unique) and text. Every document created will be shown to everyone in the lists to the left.',
          'You will also be asked if you want it to be open to the public or only those with the correct ID/code. Making it locked means that it will only be able to be opened by those with the correct ID.',
          'A second option is unlocked if you are in a team. You will asked if the document should be added to the team area. Doing so will make the document be sorted under the team\'s name for other users.',
        ]),
        this.createInstructionButton('Creating and joining a team', [
          'Being part of a team unlocks new features only available to its members',
          'TEAM show you information about your team. It also allows you create a team, if you are not already in one.',
          'You will find the team creator under SYSTEM. If you are already in a team you will instead get the option to invite others to your team.',
          'You can also invite other users to your team. They will find their invitation in the TEAM view, where they can choose to accept or decline it.',
          'Every member of a team has a unique icon on the map (circle with a T) to make it easier to find other members. They are also listed under TEAM in the map. A team also has a shared WALLET that they can use to accept or send virtual caps from. A team also has a common chat room and messages sent will show their team name to others.',
        ]),
        this.createInstructionButton('Earning viritual caps', [
          'You can choose to do maintenance on a LANTERN. Go to PROGRAMS and "lanternMaintenance" to start it up. You will be first be asked to choose a LANTERN. The payout amount in virtual caps is shown to the right of each option.',
          'The next part is where you are given a code. This is the code that you have to input into the LANTERN that you chose to complete the mission. You will see a transaction in WALLET when you have completed the mission.',
        ]),
        this.createInstructionButton('Using and creating loot codes', [
          'You will find the option in this view, to the left under SYSTEM, to craete them. This is a code that you can write down on a piece of paper and allow others to loot.',
          'Codes are used in credsCracker in PROGRAMS. It is the command you use to input a loot code and steal some virtual caps. A transaction will be shown in your WALLET.',
          'Each code can only be used once.',
        ]),
        this.createInstructionButton('Setting coordinates on devices without GPS', [
          'You will find the option to do so in this view, to the left under SYSTEM.',
        ]),
        this.createInstructionButton('Creating and reading rumours/dassrykten', [
          'You will find them in this view, to the right. You can create new ones under SYSTEM. The rumours are meant to be fun bits that other players can use to create play.',
        ]),
        this.createInstructionButton('Creating and using a unique alias', [
          'An alias is an alternative character/user name. You can use them to act as if you were another character without having to create separate accounts',
          'NOTE! This alias is unique and will only be available through your account. Want a shared alias for document creation? Open up the topic below this one.',
          'This alias can be used to make it look like documents were created or messages sent by this name instead of your default user name',
          'You create them to the left in this view. Your created alias will be shown in FILES and CHAT under ALIASES.',
          'In CHAT: click on the alias you want to be used when sending a message.',
          'In FILES: click on CREATE DOC and then the alias you want to use. This will be the name shown as the creator of the document and will also be sorted under that name under DIRECTORY.',
        ]),
        this.createInstructionButton('Creating and using a shared file alias', [
          'An alias is an alternative character/user name. You can use them to act as if you were another character without having to create separate accounts',
          'The different between a files alias and the other one is that this one can only be used in the creation of documents. It can also be shared by all your team members (if you are in a team). All they have to do is create the same alias.',
          'Your new alias will be available to the left in FILES under ALIASES. Start by clicking on CREATE DOC and then choose the alias you want to be shown as the creator.',
        ]),
      ],
    });
    const items = [
      this.createInstructionButton('Start here', [
        'The first view you see is called HOME. The view you are in now is SUPPORT.',
        'If you click on any button in Home you\'ll switch to a new view, like you did when you got here.',
        'To get back to HOME you can click on the top row.',
        'Characters within [] indicate that the button can be used through a keyboard shortcut. Example: [L]OGIN can be triggered with alt+L.',
      ]),
      topics.element,
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
                    } else if (createError.type === 'not allowed') {
                      createDialog.changeExtraDescription({ text: ['Not allowed to create alias'] });

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
                    } else if (createError.type === 'not allowed') {
                      createDialog.changeExtraDescription({ text: ['Not allowed to create alias'] });

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
