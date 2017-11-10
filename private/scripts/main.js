/*
 Copyright 2016 Aleksandar Jankovic

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

require('../library/polyfills');

const LoginBox = require('../library/view/templates/LoginBox');
const Messenger = require('../library/view/templates/Messenger');
const OnlineStatus = require('../library/view/templates/OnlineStatus');
// const Home = require('../library/view/templates/Home');
// const SoundElement = require('../library/audio/SoundElement');
const TextAnimation = require('../library/view/templates/TextAnimation');
const Profile = require('../library/view/templates/Profile');
const Wallet = require('../library/view/templates/Wallet');
const ButtonBox = require('../library/view/templates/ButtonBox');
const TeamViewer = require('../library/view/templates/TeamViewer');
const Tracker = require('../library/view/worldMap/Tracker');
const DialogBox = require('../library/view/DialogBox');
const Forum = require('../library/view/templates/Forum');
const DirViewer = require('../library/view/templates/DirViewer');

const keyHandler = require('../library/KeyHandler');
const socketManager = require('../library/SocketManager');
const storageManager = require('../library/StorageManager');
const textTools = require('../library/TextTools');
const viewTools = require('../library/ViewTools');
const eventCentral = require('../library/EventCentral');
const soundLibrary = require('../library/audio/SoundLibrary');
const elementCreator = require('../library/ElementCreator');
const tools = require('../library/Tools');

const mainView = document.getElementById('main');
const top = document.getElementById('top');
const onlineStatus = new OnlineStatus(top);

// const home = new Home({
//   introText: [
//     elementCreator.createParagraph({
//       text: 'Organica Oracle Operating System (O3C) 5.0 Razor Edition',
//     }),
//     elementCreator.createParagraph({
//       text: 'Welcome, employee. This is your cyberhome. You can always find your way to your cyberhome by clicking on the top menu. May you have a productive day!',
//     }),
//   ],
//   introDevText: [
//     elementCreator.createParagraph({
//       classes: ['redBack'],
//       text: 'THIS IS A EXPERIMENTAL SERVER. This will NOT be used during the event. You can play around as much as you want. Stuff might be broken. Data might be lost. Save a copy of everything of importance.',
//     }),
//     elementCreator.createParagraph({ text: 'Main developer: Aleksandar Jankovic' }),
//     elementCreator.createParagraph({ text: 'More info at:' }),
//     elementCreator.createLink({
//       text: 'Patreon',
//       href: 'http://patreon.com/yxeri',
//       target: '_blank',
//     }),
//     elementCreator.createLink({
//       text: 'Facebook',
//       href: 'https://www.facebook.com/thethirdgiftgames/',
//       target: '_blank',
//     }),
//     elementCreator.createParagraph({ text: 'This project is kept alive by your donations. Any small amount helps! Help support the project at ' }),
//     elementCreator.createLink({
//       text: 'Patreon',
//       href: 'http://patreon.com/yxeri',
//       target: '_blank',
//     }),
//     elementCreator.createParagraph({ text: 'Do you want to expand the world of BBR?' }),
//     elementCreator.createLink({
//       text: 'Join the cartographer group',
//       href: 'https://www.facebook.com/groups/585709954945167/',
//       target: '_blank',
//     }),
//     elementCreator.createParagraph({
//       text: 'NOTE! Use Chrome on laptop/desktop/Android devices and Safari for Apple phone/tablet devices. It may not work properly in other browsers',
//     }),
//   ],
// });
const messenger = new Messenger({ isFullscreen: true, sendButtonText: 'Send', isTopDown: false });
const forum = new Forum({});
const walletViewer = new Wallet({ suffix: '¥' });
const dirViewer = new DirViewer({ isFullscreen: true });

let currentView = forum;
forum.appendTo(mainView);

let isClosed = false;
const logIn = elementCreator.createContainer({
  func: () => {
    if (isClosed) {
      isClosed = false;

      return;
    }

    if (storageManager.getToken()) {
      const aliases = storageManager.getAliases().concat([storageManager.getUserName()]);
      const aliasElements = aliases.map((alias) => {
        return elementCreator.createListItem({
          element: elementCreator.createSpan({ text: alias }),
          func: (event) => {
            const aliasElement = elementCreator.createSpan({
              text: `u_ ${alias}`,
            });

            if (alias !== storageManager.getUserName()) {
              storageManager.setSelectedAlias(alias);
            } else {
              storageManager.removeSelectedAlias();
            }

            logIn.removeChild(logIn.lastElementChild);
            logIn.replaceChild(aliasElement, logIn.firstElementChild);

            event.stopPropagation();
            event.preventDefault();
          },
        });
      });

      const logoutElement = elementCreator.createListItem({
        element: elementCreator.createSpan({ text: 'log_off' }),
        classes: ['logout'],
        func: (event) => {
          logIn.removeChild(logIn.lastElementChild);
          logIn.replaceChild(elementCreator.createSpan({ text: 'login' }), logIn.firstElementChild);

          eventCentral.triggerEvent({ event: eventCentral.Events.LOGOUT });

          event.stopPropagation();
          event.preventDefault();
        },
      });
      const newAliasElement = elementCreator.createListItem({
        element: elementCreator.createSpan({ text: 'new_handle' }),
        func: () => {
          const createDialog = new DialogBox({
            buttons: {
              left: {
                text: 'cancel',
                eventFunc: () => {
                  createDialog.removeView();
                },
              },
              right: {
                text: 'create',
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
                        createDialog.changeExtraDescription({ text: ['Handle already exists'] });

                        return;
                      }

                      createDialog.changeExtraDescription({ text: ['Something went wrong.', 'Unable to create handle'] });

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
              placeholder: 'Handle',
              inputName: 'alias',
              isRequired: true,
              maxLength: 10,
            }],
            description: [
              'You can never have too many burner handles',
            ],
            extraDescription: ['Enter your new handle'],
          });

          createDialog.appendTo(mainView);
        },
      });
      const spacerElement = elementCreator.createListItem({ element: elementCreator.createSpan({ text: '_system' }), classes: ['systemSpacer'] });

      const userElement = elementCreator.createSpan({
        text: `u_ ${storageManager.getSelectedAlias() || storageManager.getUserName()}`,
        func: () => {
          if (logIn.childElementCount > 1) {
            isClosed = true;
            logIn.removeChild(logIn.lastElementChild);
          }
        },
      });

      const fragment = document.createDocumentFragment();
      const systemItems = [spacerElement, newAliasElement, logoutElement];

      fragment.appendChild(userElement);
      fragment.appendChild(elementCreator.createList({
        elements: aliasElements.concat(systemItems),
        classes: ['userList'],
      }));

      logIn.innerHTML = '';
      logIn.appendChild(fragment);

      return;
    }

    const loginBox = new LoginBox({
      socketManager,
      keyHandler,
      description: [
        'running sh_v-3.1.17',
        'current user: anon_user',
        'auth required',
      ],
      extraDescription: ['input your main handle and password'],
      parentElement: mainView,
    });

    loginBox.appendTo(mainView);
  },
});

const bbsTop = elementCreator.createContainer({
  func: () => {
    if (currentView !== forum) {
      if (logIn.childElementCount > 1) {
        logIn.removeChild(logIn.lastElementChild);
      }

      currentView.removeView();
      currentView = forum;
      forum.appendTo(mainView);
    }
  },
});

const msgTop = elementCreator.createContainer({
  func: () => {
    if (currentView !== messenger) {
      if (logIn.childElementCount > 1) {
        logIn.removeChild(logIn.lastElementChild);
      }

      currentView.removeView();
      currentView = messenger;
      messenger.appendTo(mainView);
    }
  },
});

const dirTop = elementCreator.createContainer({
  elementId: 'dirTop',
  func: () => {
    if (currentView !== dirViewer) {
      if (logIn.childElementCount > 1) {
        logIn.removeChild(logIn.lastElementChild);
      }

      currentView.removeView();
      currentView = dirViewer;
      dirViewer.appendTo(mainView);
    }
  },
});

const walletTop = elementCreator.createContainer({
  elementId: 'walletTop',
  func: () => {
    if (currentView !== walletViewer) {
      if (logIn.childElementCount > 1) {
        logIn.removeChild(logIn.lastElementChild);
      }

      currentView.removeView();
      currentView = walletViewer;
      walletViewer.appendTo(mainView);
    }
  },
});

if (storageManager.getToken()) {
  logIn.appendChild(elementCreator.createSpan({
    text: `u_ ${storageManager.getSelectedAlias() || storageManager.getUserName()}`,
  }));
} else {
  logIn.appendChild(elementCreator.createSpan({ text: 'login' }));
}

walletTop.appendChild(elementCreator.createSpan({
  text: '0¥',
}));
msgTop.appendChild(elementCreator.createSpan({
  text: 'msg',
}));
dirTop.appendChild(elementCreator.createSpan({
  text: 'dir',
}));

bbsTop.appendChild(elementCreator.createSpan({ text: 'bbs' }));

top.appendChild(elementCreator.createContainer({ classes: ['menuRightCorner'] }));
top.appendChild(logIn);
top.appendChild(bbsTop);
top.appendChild(msgTop);
top.appendChild(dirTop);
top.appendChild(walletTop);

eventCentral.addWatcher({
  watcherParent: this,
  event: eventCentral.Events.USER,
  func: () => {
    logIn.innerHTML = '';

    if (storageManager.getToken()) {
      logIn.appendChild(elementCreator.createSpan({
        text: `u_ ${storageManager.getSelectedAlias() || storageManager.getUserName()}`,
      }));
    } else {
      logIn.appendChild(elementCreator.createSpan({ text: 'login' }));
    }
  },
});

const boot = new TextAnimation({ removeTime: 700, triggerValue: 'firstBoot' });
// const signalBlockAnimation = new TextAnimation({ isPermanent: true });
const queryParameters = tools.getQueryParameters();

// boot.setQueue([
//   {
//     func: boot.printLines,
//     params: {
//       corruption: true,
//       classes: ['logo'],
//       array: [
//         '                          ####',
//         '                ####    #########    ####',
//         '               ###########################',
//         '              #############################',
//         '            #######        ##   #  ##########',
//         '      ##########           ##    #  ###  ##########',
//         '     #########             #########   #   #########',
//         '       #####               ##     ########   #####',
//         '     #####                 ##     ##     ##########',
//         '     ####                  ##      ##     #   ######',
//         ' #######                   ##########     ##    ########',
//         '########                   ##       ########     ########',
//         ' ######      Organica      ##       #      #############',
//         '   ####     Oracle         ##       #      ##     ####',
//         '   ####     Operating      ##       #      ##    #####',
//         '   ####      System        ##       #      ###########',
//         '########                   ##       #########    ########',
//         '########                   ##########      #    #########',
//         ' ########                  ##      ##     ## ###########',
//         '     #####                 ##      ##     ### #####',
//         '       #####               ##     ########   #####',
//         '      #######              ##########   #  ########',
//         '     ###########           ##    ##    # ###########',
//         '      #############        ##    #   #############',
//         '            ################################',
//         '              ############################',
//         '              #######  ##########  #######',
//         '                ###      ######      ###',
//         '                          ####',
//       ],
//     },
//   }, {
//     func: boot.printLines,
//     params: {
//       corruption: false,
//       array: [
//         'Connecting to HQ...',
//         '...',
//         '...',
//         'Failed to connect to HQ',
//         'Rerouting...',
//       ],
//     },
//   }, {
//     func: boot.printLines,
//     params: {
//       waitTime: 700,
//       corruption: false,
//       array: [
//         'Connected!',
//         'Welcome to the Oracle, employee UNDEFINED.',
//         'May you have a productive day!',
//         '',
//         'Establishing uplink to relays...',
//       ],
//     },
//   }, {
//     func: boot.printLines,
//     params: {
//       waitTime: 1200,
//       corruption: false,
//       array: [
//         'Uplink established!',
//         'Downloading modules...',
//         'LAMM  - LANTERN Amplification Master Manipulator',
//         'OSAT  - Organica System Administrator Toolset',
//         'CHAT  - Communication Host-Agent Tracker',
//         'CREDS - Computer Registered Evaluative Decision System',
//         'PANIC - PANIC-Assisted Neglect Information Collector',
//         'YOU   - YOU Object Unifier',
//         'Booting O3S 5.0...',
//       ],
//     },
//   }, {
//     func: boot.printLines,
//     params: {
//       classes: ['logo'],
//       corruption: true,
//       array: [
//         'THIS RELEASE OF O3S WAS BROUGHT TO YOU BY',
//         '   ####',
//         '###############',
//         ' #####  #########                                           ####',
//         '  ####     #######  ########     ###########    ####     ###########',
//         '  ####    ######      #######   ####   #####  ########    ####   #####',
//         '  ####  ###         ####  ####        ####  ###    ###### ####   #####',
//         '  #########        ####    ####     ####   #####     ##############',
//         '  #### ######     ####     #####  ####     #######   ###  ########',
//         '  ####   ######  ##### #### #### ############  #######    ####   ###',
//         ' ######    #############    ################     ###      ####    #####',
//         '########     ########        ####                        ######      #####   ##',
//         '               ###########        ##                                    ###### ',
//         '                    ###############',
//         '                  Razor  #####  Demos - Warez - Honey',
//         'ENJOY',
//       ],
//     },
//   }, {
//     func: boot.printLines,
//     params: {
//       corruption: false,
//       array: [
//         'Organica approved device detected!',
//         'Rewriting firmware...',
//         'Overriding lock...',
//       ],
//     },
//   }, {
//     func: boot.printLines,
//     params: {
//       corruption: false,
//       array: [
//         'Loading',
//         '...',
//         '...',
//         '...',
//         '...',
//       ],
//     },
//   },
// ]);

if (!queryParameters.key && !queryParameters.mailEvent && !queryParameters.noBoot) {
  const firstBoot = storageManager.getLocalVal('firstBoot');

  if (typeof firstBoot === 'undefined' || firstBoot !== 'true') {
    // boot.appendTo(mainView);
    storageManager.setLocalVal('firstBoot', 'true');
  }
}

soundLibrary.toggleSounds();

if (!storageManager.getRoom()) {
  storageManager.setRoom('public');
}

if (!storageManager.getDeviceId()) {
  storageManager.setDeviceId(textTools.createAlphaNumbericalString(16));
}

window.addEventListener('error', (event) => {
  console.log(event.error);

  return false;
});

mainView.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

keyHandler.setTriggerKey(18); // Alt
keyHandler.addIgnoredKey(17); // Ctrl
keyHandler.addIgnoredKey(27); // Esc
keyHandler.addIgnoredKey(91); // Win/Cmd
keyHandler.addIgnoredKey(93); // Win/Cmd
// keyHandler.addKey(32, () => { home.appendTo(mainView); });

eventCentral.addWatcher({
  watcherParent: this,
  event: eventCentral.Events.LOGOUT,
  func: () => {
    storageManager.removeUser();
    eventCentral.triggerEvent({ event: eventCentral.Events.USER, params: { changedUser: true } });
    eventCentral.triggerEvent({ event: eventCentral.Events.FOLLOWROOM, params: { room: { roomName: 'public' } } });
  },
});

eventCentral.addWatcher({
  watcherParent: this,
  event: eventCentral.Events.LOGIN,
  func: () => {
    eventCentral.triggerEvent({ event: eventCentral.Events.USER, params: { changedUser: true } });
  },
});

eventCentral.addWatcher({
  watcherParent: messenger,
  event: eventCentral.Events.CHATMSG,
  func: () => { soundLibrary.playSound('msgReceived'); },
});

if (!queryParameters.noFullscreen) {
  // F1
  keyHandler.addKey(112, viewTools.goFullScreen);

  window.addEventListener('click', () => {
    viewTools.goFullScreen();
  });
}

// home.addLink({
//   linkName: 'login',
//   startFunc: () => {
//     new LoginBox({
//       description: ['Welcome, employee! You have to login to begin your productive day!', 'All your actions in O3C will be monitored'],
//       extraDescription: ['Input your user name and password', 'Allowed characters in the name: a-z 0-9'],
//       parentElement: mainView,
//       socketManager,
//       keyHandler,
//       closeFunc: () => { home.endLink('login'); },
//     }).appendTo(mainView);
//   },
//   endFunc: () => {},
//   accessLevel: 0,
//   maxAccessLevel: 0,
//   keepHome: true,
//   classes: ['hide'],
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'chat',
//   startFunc: () => { messenger.appendTo(mainView); },
//   endFunc: () => { messenger.removeView(); },
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'files',
//   startFunc: () => { dirViewer.appendTo(mainView); },
//   endFunc: () => { dirViewer.removeView(); },
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'wallet',
//   startFunc: () => { walletViewer.appendTo(mainView); },
//   endFunc: () => { walletViewer.removeView(); },
//   classes: ['hide'],
//   accessLevel: 1,
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'team',
//   startFunc: () => { teamViewer.appendTo(mainView); },
//   endFunc: () => { teamViewer.removeView(); },
//   accessLevel: 1,
//   classes: ['hide'],
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'panic',
//   startFunc: () => {
//     const panicBox = new ButtonBox({
//       description: [
//         'Employee UNDEFINED. You have activated the PANIC-Assisted Neglect Information Collector (PANIC). Remain calm to minimize blood leakage and increase your survivability.',
//         'By proceeding, you agree to have your position retrieved and sent to those who can best help you.',
//         'Choose the option that best describes your current situation:',
//         ' ',
//         '"I\'m being murdered by a "',
//       ],
//       buttons: [
//         elementCreator.createButton({
//           text: 'Group of Panzerwolves',
//           func: () => {
//             const bestPosition = tracker.getBestPosition();
//
//             if (!bestPosition) {
//               console.log(bestPosition);
//
//               panicBox.changeDescription({
//                 text: [
//                   'Unable to pinpoint your position.',
//                   'Thank you for using PANIC!',
//                 ],
//               });
//
//               panicBox.replaceButtons({
//                 buttons: [
//                   elementCreator.createButton({
//                     text: 'Oh no...',
//                     func: () => { panicBox.removeView(); },
//                   }),
//                 ],
//               });
//               return;
//             }
//
//             const position = {
//               coordinates: bestPosition.coordinates,
//               description: ['Panzerwolf raid'],
//               markerType: 'ping',
//               positionName: `${storageManager.getUserName()}-panic-ping`,
//               isPublic: true,
//               isStatic: true,
//             };
//             position.coordinates.radius = 90;
//
//             socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
//               if (error) {
//                 if (error.type === 'insufficient' || error.type === 'invalid data') {
//                   panicBox.changeDescription({
//                     text: [
//                       'Unable to pinpoint your position.',
//                       'Thank you for using PANIC!',
//                     ],
//                   });
//
//                   panicBox.replaceButtons({
//                     buttons: [
//                       elementCreator.createButton({
//                         text: 'Oh no...',
//                         func: () => { panicBox.removeView(); },
//                       }),
//                     ],
//                   });
//                   return;
//                 }
//
//                 panicBox.changeDescription({
//                   text: [
//                     'Something went wrong.',
//                     'Unable to send ping.',
//                     'Thank you for using PANIC',
//                   ],
//                 });
//
//                 panicBox.replaceButtons({
//                   buttons: [
//                     elementCreator.createButton({
//                       text: 'Oh no...',
//                       func: () => { panicBox.removeView(); },
//                     }),
//                   ],
//                 });
//
//                 return;
//               }
//
//               panicBox.changeDescription({
//                 text: [
//                   'You have selected: "I\'m being murdered by a group of Panzerwolves."',
//                   'The Organica corporation and the Panzerwolves have a written non-aggression pact.',
//                   'We recommend that you cite Agreement 233.75.1.12 to cease the murder process.',
//                   'A team of lawyers will be sent to your location.',
//                   'Thank you for using PANIC!',
//                 ],
//               });
//               panicBox.replaceButtons({
//                 buttons: [
//                   elementCreator.createButton({
//                     text: 'Thank you!',
//                     func: () => { panicBox.removeView(); },
//                   }),
//                 ],
//               });
//
//               eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
//             });
//           },
//         }),
//         elementCreator.createButton({
//           text: 'Organica re-education team',
//           func: () => {
//             const bestPosition = tracker.getBestPosition();
//
//             if (!bestPosition) {
//               console.log(bestPosition);
//
//               panicBox.changeDescription({
//                 text: [
//                   'Unable to pinpoint your position.',
//                   'Thank you for using PANIC!',
//                 ],
//               });
//
//               panicBox.replaceButtons({
//                 buttons: [
//                   elementCreator.createButton({
//                     text: 'Oh no...',
//                     func: () => { panicBox.removeView(); },
//                   }),
//                 ],
//               });
//               return;
//             }
//
//             const position = {
//               coordinates: bestPosition.coordinates,
//               description: ['Organica företagsfest'],
//               markerType: 'ping',
//               positionName: `${storageManager.getUserName()}-panic-ping`,
//               isPublic: true,
//               isStatic: true,
//             };
//             position.coordinates.radius = 90;
//
//             socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
//               if (error) {
//                 if (error.type === 'insufficient') {
//                   panicBox.changeDescription({
//                     text: [
//                       'Unable to pinpoint your position',
//                       'Thank you for using PANIC',
//                     ],
//                   });
//
//                   panicBox.replaceButtons({
//                     buttons: [
//                       elementCreator.createButton({
//                         text: 'Oh no...',
//                         func: () => { panicBox.removeView(); },
//                       }),
//                     ],
//                   });
//                   return;
//                 }
//
//                 panicBox.changeDescription({
//                   text: [
//                     'Something went wrong.',
//                     'Unable to send ping.',
//                     'Thank you for using PANIC',
//                   ],
//                 });
//
//                 panicBox.replaceButtons({
//                   buttons: [
//                     elementCreator.createButton({
//                       text: 'Oh no...',
//                       func: () => { panicBox.removeView(); },
//                     }),
//                   ],
//                 });
//
//                 return;
//               }
//
//               panicBox.changeDescription({
//                 text: [
//                   'You have selected: "I\'m being murdered by a Organica re-education."',
//                   'You have been found in breach of your employment contract. Reason: {UNDEFINED}.',
//                   'Re-education is mandatory for low productivity and contract breaches.',
//                   'A second re-education team will be sent to your location to speed up the re-education process.',
//                   'Thank you for using PANIC!',
//                 ],
//               });
//               panicBox.replaceButtons({
//                 buttons: [
//                   elementCreator.createButton({
//                     text: 'Thank you!',
//                     func: () => { panicBox.removeView(); },
//                   }),
//                 ],
//               });
//
//               eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
//             });
//           },
//         }),
//         elementCreator.createButton({
//           text: 'Mugger with a gun and/or knife that hates me and my team',
//           func: () => {
//             const bestPosition = tracker.getBestPosition();
//
//             if (!bestPosition) {
//               console.log(bestPosition);
//
//               panicBox.changeDescription({
//                 text: [
//                   'Unable to pinpoint your position.',
//                   'Thank you for using PANIC!',
//                 ],
//               });
//
//               panicBox.replaceButtons({
//                 buttons: [
//                   elementCreator.createButton({
//                     text: 'Oh no...',
//                     func: () => { panicBox.removeView(); },
//                   }),
//                 ],
//               });
//
//               return;
//             }
//
//             const userName = storageManager.getUserName();
//             const position = {
//               coordinates: bestPosition.coordinates,
//               description: [`${userName} under attack`],
//               markerType: 'ping',
//               positionName: `${storageManager.getUserName()}-panic-team-ping`,
//               isPublic: false,
//               isStatic: true,
//             };
//             position.coordinates.radius = 90;
//
//             const team = storageManager.getTeam();
//
//             if (team) {
//               socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
//                 if (error) {
//                   if (error.type === 'insufficient') {
//                     panicBox.changeDescription({
//                       text: [
//                         'Unable to pinpoint your position',
//                         'Thank you for using PANIC',
//                       ],
//                     });
//
//                     panicBox.replaceButtons({
//                       buttons: [
//                         elementCreator.createButton({
//                           text: 'Oh no...',
//                           func: () => { panicBox.removeView(); },
//                         }),
//                       ],
//                     });
//                     return;
//                   }
//
//                   panicBox.changeDescription({
//                     text: [
//                       'Something went wrong.',
//                       'Unable to send ping.',
//                       'Thank you for using PANIC',
//                     ],
//                   });
//
//                   panicBox.replaceButtons({
//                     buttons: [
//                       elementCreator.createButton({
//                         text: 'Oh no...',
//                         func: () => { panicBox.removeView(); },
//                       }),
//                     ],
//                   });
//
//                   return;
//                 }
//
//                 panicBox.changeDescription({
//                   text: [
//                     'You have selected: "I\'m being murdered by a mugger with a gun and/or knife"',
//                     'We have to remind you that allowing non-employees to take your assigned Organica equipment is a breech of your employment contract',
//                     'We advice you to make certain that none of your equipment is stolen, before and after your death',
//                     'Your location will be sent to your team',
//                     'Thank you for using PANIC',
//                   ],
//                 });
//                 panicBox.replaceButtons({
//                   buttons: [
//                     elementCreator.createButton({
//                       text: 'Thank you!',
//                       func: () => { panicBox.removeView(); },
//                     }),
//                   ],
//                 });
//
//                 eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
//               });
//             } else {
//               panicBox.changeDescription({
//                 text: [
//                   'You have selected: "I\'m being murdered by a mugger with a gun and/or knife"',
//                   'Warning! We have no record of you being part of a team',
//                   'Only employees with the rank "Productive Team Member" or higher may use this service',
//                   'No notification will be sent',
//                   'Thank you for using PANIC',
//                 ],
//               });
//               panicBox.replaceButtons({
//                 buttons: [
//                   elementCreator.createButton({
//                     text: 'Oh no...',
//                     func: () => { panicBox.removeView(); },
//                   }),
//                 ],
//               });
//             }
//           },
//         }),
//         elementCreator.createButton({
//           text: '... Actually, I am fine',
//           func: () => {
//             panicBox.changeDescription({
//               text: [
//                 'You have selected: "... Actually, I am fine"',
//                 'Warning! You have wasted seconds of Organica-owned time',
//                 'Your Good Employee Affirmation Rank (GEAR) has been reset to 0',
//               ],
//             });
//             panicBox.replaceButtons({
//               buttons: [
//                 elementCreator.createButton({
//                   text: 'I will immediately sign up for voluntary re-education',
//                   func: () => { panicBox.removeView(); },
//                 }),
//               ],
//             });
//           },
//         }),
//       ],
//     });
//     panicBox.appendTo(mainView);
//   },
//   endFunc: () => {},
//   accessLevel: 1,
//   classes: ['hide'],
//   keepHome: true,
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'you',
//   startFunc: () => { profile.appendTo(mainView); },
//   endFunc: () => { profile.removeView(); },
//   accessLevel: 1,
//   classes: ['hide'],
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'support',
//   startFunc: () => { toolsViewer.appendTo(mainView); },
//   endFunc: () => { toolsViewer.removeView(); },
// });
// home.addLink({
//   linkName: 'logout',
//   startFunc: () => {
//     socketManager.emitEvent('logout', { device: { deviceId: storageManager.getDeviceId() } }, (error) => {
//       if (error) {
//         console.log(error);
//       }
//
//       boot.appendTo(mainView);
//       eventCentral.triggerEvent({ event: eventCentral.Events.LOGOUT });
//       home.endLink('logout');
//     });
//   },
//   accessLevel: 1,
//   keepHome: true,
//   classes: ['hide'],
//   shortcut: true,
// });
// home.addLink({
//   linkName: 'forum',
//   startFunc: () => { forum.appendTo(mainView); },
//   endFunc: () => { forum.removeView(); },
//   accessLevel: 0,
//   classes: ['hide'],
//   shortcut: true,
// });

// home.appendTo(mainView);

// eventCentral.addWatcher({
//   watcherParent: this,
//   event: eventCentral.Events.SIGNALBLOCK,
//   func: ({ removeBlocker, blockedBy }) => {
//     if (removeBlocker || !blockedBy) {
//       storageManager.removeBlockedBy();
//       signalBlockAnimation.end();
//
//       return;
//     }
//
//     storageManager.setBlockedBy(blockedBy);
//
//     signalBlockAnimation.setQueue([
//       {
//         func: signalBlockAnimation.printLines,
//         params: {
//           array: [
//             '                            ..  .........',
//             '                    `````..  ..        `````',
//             '               .:.```````                  `.--`',
//             '             ./:.--``..  ``                  `.:-',
//             '            .-....---:--  ``       .`      ``..---`',
//             '           `:://:/+/:-.  -.`               ``.-:/--',
//             '            :::+oosso-  ``                ```.-:+/:`',
//             '           `::oyhysso  ``               `  ```.:/+/-',
//             '            --:/+/:..  ``                 `.  `.:/:`',
//             '             ...```           ` `              ...',
//             '                `````````.-`  +sh+.++.....``````',
//             '                         .-...-//.::.',
//             '                         -o+o::/o++-:',
//             '         `````````````  .:://:::++o+/:`      ```````````..`',
//             '     ..-::/osssyhy+o/..-/+oooosso+sso+::-...-/sys/:--:+oohh-.',
//             '`.-/+ossyhhhmmMMMmysoosshhhdhhdNmhyhyssh++:-/+++:/+yssmNNmhyyy/',
//             '`/+++++oyhyyhddhyoo///::////////::/++oo++os++oo+oosssssyhhhyyss:',
//           ],
//           waitTime: 3000,
//           lineTime: 500,
//           pre: true,
//         },
//       }, {
//         func: signalBlockAnimation.printLines,
//         params: {
//           waitTime: 4000,
//           corruption: false,
//           array: [
//             'ERROR',
//             'Lost signal',
//             'Attempting to reconnect...',
//           ],
//         },
//       }, {
//         func: signalBlockAnimation.printLines,
//         params: {
//           waitTime: 4000,
//           corruption: false,
//           array: [
//             'Tracing jamming source...',
//             'Tracking....',
//             'Attempting to reconnect...',
//           ],
//         },
//       }, {
//         func: signalBlockAnimation.printLines,
//         params: {
//           waitTime: 4000,
//           corruption: false,
//           array: [
//             'Source found!',
//             `Source: user ${blockedBy}`,
//           ],
//         },
//       }, {
//         func: signalBlockAnimation.printLines,
//         params: {
//           waitTime: 6000,
//           corruption: false,
//           array: [
//             'ERROR',
//             'Unable to reconnect',
//             'Attempting to reconnect...',
//           ],
//           repeatAmount: 16,
//         },
//       },
//     ]);
//     signalBlockAnimation.appendTo(mainView);
//   },
// });

socketManager.addEvents([
  {
    event: 'disconnect',
    func: () => {
      onlineStatus.setOffline();
    },
  }, {
    event: 'reconnect',
    func: () => {
      onlineStatus.setOnline();
      socketManager.reconnectDone();
    },
  }, {
    event: 'startup',
    func: ({ data }) => {
      const { dayModification, yearModification, centerLat, centerLong, cornerOneLat, cornerOneLong, cornerTwoLat, cornerTwoLong, defaultZoomLevel, mode, showDevInfo, requiresVerification } = data;
      storageManager.setYearModification(yearModification);
      storageManager.setDayModification(dayModification);
      storageManager.setCenterCoordinates(centerLong, centerLat);
      storageManager.setCornerOneCoordinates(cornerOneLong, cornerOneLat);
      storageManager.setCornerTwoCoordinates(cornerTwoLong, cornerTwoLat);
      storageManager.setDefaultZoomLevel(defaultZoomLevel);
      storageManager.setRequiresVerification(requiresVerification);

      eventCentral.triggerEvent({ event: eventCentral.Events.SERVERMODE, params: { mode, showDevInfo } });

      onlineStatus.setOnline();
      socketManager.updateId();

      if (queryParameters) {
        const mailEvent = queryParameters.mailEvent;
        const key = queryParameters.key;

        if (mailEvent && key) {
          if (mailEvent === 'userVerify') {
            const verifyBox = new ButtonBox({
              description: [''],
              buttons: [
                elementCreator.createButton({
                  text: 'Confirmed',
                  func: () => {
                    window.location.replace(location.pathname);
                  },
                }),
              ],
            });

            socketManager.emitEvent('verifyUser', { key }, ({ error, data: verifyData }) => {
              if (error) {
                if (error.type === 'expired') {
                  verifyBox.changeDescription({
                    text: [
                      'Your verification request has expired.',
                      'You will need to re-register your user.',
                    ],
                  });
                } else {
                  verifyBox.changeDescription({
                    text: ['Something went wrong.', 'Unable to verify user.'],
                  });
                }

                verifyBox.appendTo(mainView);

                return;
              }

              verifyBox.changeDescription({
                text: [
                  'Your user has been verified.',
                  `Welcome to the Organica Oracle Operating System (O3C), employee ${verifyData.userName}.`,
                  'Your Good Employee Affirmation Rank (GEAR) is 0.',
                  'May you have a productive day.',
                ],
              });
              verifyBox.appendTo(mainView);
            });
          } else if (mailEvent === 'passwordReset') {
            const passwordDialog = new DialogBox({
              description: [
                'Password reset request confirmed.',
                'Enter your new password.',
              ],
              buttons: {
                left: {
                  text: 'Cancel',
                  eventFunc: () => {
                    window.location.replace(location.pathname);
                  },
                },
                right: {
                  text: 'Change',
                  eventFunc: () => {
                    const emptyFields = passwordDialog.markEmptyFields();
                    const reenterPasswordInput = passwordDialog.inputs.find(({ inputName }) => inputName === 'reenterPassword').inputElement;
                    const passwordInput = passwordDialog.inputs.find(({ inputName }) => inputName === 'password').inputElement;

                    if (emptyFields) {
                      soundLibrary.playSound('fail');
                      passwordDialog.changeExtraDescription({ text: ['You cannot leave obligatory fields empty!'] });

                      return;
                    } else if (reenterPasswordInput.value !== passwordInput.value) {
                      soundLibrary.playSound('fail');
                      passwordDialog.changeExtraDescription({ text: ['Passwords do not match. Try again.'] });
                      passwordDialog.clearInput('password');
                      passwordDialog.clearInput('reenterPassword');
                      passwordDialog.focusInput('password');

                      return;
                    }

                    const confirmBox = new ButtonBox({
                      description: [''],
                      buttons: [
                        elementCreator.createButton({
                          text: 'Confirmed',
                          func: () => {
                            window.location.replace(location.pathname);
                          },
                        }),
                      ],
                    });

                    socketManager.emitEvent('changePassword', { key, password: passwordInput.value }, ({ error }) => {
                      if (error) {
                        if (error.type === 'expired') {
                          confirmBox.changeDescription({ text: ['Your password reset request has expired. You will have to make a new request.'] });
                        } else {
                          confirmBox.changeDescription({
                            text: [
                              'Something went wrong.',
                              'Failed to change the password.',
                            ],
                          });
                        }

                        passwordDialog.removeView();
                        confirmBox.appendTo(mainView);

                        return;
                      }

                      confirmBox.changeDescription({ text: ['Your password has been successfully changed.'] });
                      passwordDialog.removeView();
                      confirmBox.appendTo(mainView);
                    });
                  },
                },
              },
              inputs: [{
                placeholder: 'Password',
                inputName: 'password',
                type: 'password',
                isRequired: true,
                maxLength: 100,
              }, {
                placeholder: 'Re-enter your password',
                inputName: 'reenterPassword',
                type: 'password',
                isRequired: true,
                maxLength: 100,
              }],
            });
            passwordDialog.appendTo(mainView);
          }
        }
      }
    },
  }, {
    event: 'message',
    func: ({ data }) => {
      const { message } = data;
      console.log(message);
    },
  }, {
    event: 'history',
    func: ({ data }) => {
      const { roomName, messages, timeZoneOffset, anonymous, isWhisper } = data.history;
      eventCentral.triggerEvent({
        event: eventCentral.Events.HISTORY,
        params: { roomName, messages, timeZoneOffset, anonymous, isWhisper, options: { printable: false } },
      });
    },
  }, {
    event: 'chatMsg',
    func: ({ data }) => {
      const { message, timeZoneOffset, isWhisper, roomName } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.CHATMSG,
        params: { roomName, message, isWhisper, timeZoneOffset, options: { printable: false } },
      });
    },
  }, {
    event: 'docFile',
    func: ({ data }) => {
      const { docFile, updating, oldTitle, oldTeam } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.DOCFILE,
        params: { docFile, updating, oldTitle, oldTeam },
      });
    },
  }, {
    event: 'logout',
    func: () => {
      logIn.innerHTML = '';
      logIn.appendChild(elementCreator.createSpan({ text: 'login' }));

      eventCentral.triggerEvent({
        event: eventCentral.Events.LOGOUT,
      });
    },
  }, {
    event: 'bcastMsg',
    func: ({ data }) => {
      const { message } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.BCASTMSG,
        params: { message },
      });
    },
  }, {
    event: 'transaction',
    func: ({ data }) => {
      const { transaction, wallet } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.TRANSACTION,
        params: { transaction, wallet },
      });
    },
  }, {
    event: 'mapPositions',
    func: ({ data }) => {
      const { positions, currentTime, shouldRemove } = data;

      if (shouldRemove) {
        eventCentral.triggerEvent({
          event: eventCentral.Events.REMOVEPOSITIONS,
          params: { positions },
        });
      } else {
        eventCentral.triggerEvent({
          event: eventCentral.Events.POSITIONS,
          params: { positions, currentTime },
        });
      }
    },
  }, {
    event: 'mapLabels',
    func: () => {

    },
  }, {
    event: 'mapEvents',
    func: () => {},
  }, {
    event: 'terminal',
    func: (data) => {
      const { mission } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.TERMINAL,
        params: { mission },
      });
    },
  }, {
    event: 'follow',
    func: ({ data }) => {
      const { whisperTo, whisper, room, data: followData } = data;

      if (whisperTo) {
        room.roomName = followData.replace('-whisper-', ' <-> ');
      }

      eventCentral.triggerEvent({
        event: eventCentral.Events.FOLLOWROOM,
        params: { room, whisper, data: followData },
      });
    },
  }, {
    event: 'unfollow',
    func: ({ data }) => {
      const { room } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.UNFOLLOWROOM,
        params: { room },
      });
    },
  }, {
    event: 'simpleMsg',
    func: ({ data }) => {
      const { simpleMsg } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.SIMPLEMSG,
        params: { simpleMsg },
      });
    },
  }, {
    event: 'gameCode',
    func: ({ data }) => {
      const { gameCode } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.GAMECODE,
        params: { gameCode },
      });
    },
  }, {
    event: 'signalBlock',
    func: ({ data }) => {
      const { position, removeBlocker, blockedBy } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.SIGNALBLOCK,
        params: { position, removeBlocker, blockedBy },
      });
    },
  }, {
    event: 'room',
    func: ({ data }) => {
      const { room, isProtected } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.NEWROOM,
        params: { room, isProtected },
      });
    },
  }, {
    event: 'team',
    func: ({ data }) => {
      const { team } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.NEWTEAM,
        params: { team },
      });
    },
  }, {
    event: 'invitation',
    func: ({ data }) => {
      const { invitation } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.INVITATION,
        params: { invitation },
      });
    },
  }, {
    event: 'user',
    func: ({ data }) => {
      const { user } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.NEWUSER,
        params: { user },
      });
    },
  }, {
    event: 'teamMember',
    func: ({ data }) => {
      const { user } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.NEWMEMBER,
        params: { user },
      });
    },
  }, {
    event: 'lanternTeams',
    func: ({ data }) => {
      const { teams } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.LANTERNTEAMS,
        params: { teams },
      });
    },
  }, {
    event: 'lanternStations',
    func: ({ data }) => {
      const { stations } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.LANTERNSTATIONS,
        params: { stations },
      });
    },
  }, {
    event: 'lanternRound',
    func: ({ data }) => {
      const { round, timeLeft } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.LANTERNROUND,
        params: { round, timeLeft },
      });
    },
  }, {
    event: 'ban',
    func: () => {
      eventCentral.triggerEvent({
        event: eventCentral.Events.LOGOUT,
        params: {},
      });
    },
  }, {
    event: 'forumPosts',
    func: ({ data }) => {
      const { posts } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.FORUMPOSTS,
        params: { posts },
      });
    },
  }, {
    event: 'forumThreads',
    func: ({ data }) => {
      const { threads } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.FORUMTHREADS,
        params: { threads },
      });
    },
  },
  // {
  //   event: 'roomFollower',
  //   func: ({ userName, roomName, isFollowing }) => {
  //
  //   },
]);
