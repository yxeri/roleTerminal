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
const Clock = require('../library/view/templates/Clock');
const OnlineStatus = require('../library/view/templates/OnlineStatus');
const WorldMap = require('../library/view/worldMap/WorldMap');
const DirViewer = require('../library/view/templates/DirViewer');
const Home = require('../library/view/templates/Home');
// const SoundElement = require('../library/audio/SoundElement');
const TextAnimation = require('../library/view/templates/TextAnimation');
const Profile = require('../library/view/templates/Profile');
const Wallet = require('../library/view/templates/Wallet');
const Terminal = require('../library/view/templates/Terminal');
const ButtonBox = require('../library/view/templates/ButtonBox');
const TeamViewer = require('../library/view/templates/TeamViewer');
const ToolsViewer = require('../library/view/templates/ToolsViewer');
const Tracker = require('../library/view/worldMap/Tracker');
const DialogBox = require('../library/view/DialogBox');

const keyHandler = require('../library/KeyHandler');
const deviceChecker = require('../library/DeviceChecker');
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
const onlineStatus = new OnlineStatus(document.getElementById('onlineStatus'));
const boot = new TextAnimation({ removeTime: 3000 });
const signalBlockAnimation = new TextAnimation({ isPermanent: true });
const queryParameters = tools.getQueryParameters();

boot.setQueue([
  {
    func: boot.printLines,
    params: {
      corruption: true,
      classes: ['logo'],
      array: [
        '                          ####',
        '                ####    #########    ####',
        '               ###########################',
        '              #############################',
        '            #######        ##   #  ##########',
        '      ##########           ##    #  ###  ##########',
        '     #########             #########   #   #########',
        '       #####               ##     ########   #####',
        '     #####                 ##     ##     ##########',
        '     ####                  ##      ##     #   ######',
        ' #######                   ##########     ##    ########',
        '########                   ##       ########     ########',
        ' ######      Organica      ##       #      #############',
        '   ####     Oracle         ##       #      ##     ####',
        '   ####     Operating      ##       #      ##    #####',
        '   ####      System        ##       #      ###########',
        '########                   ##       #########    ########',
        '########                   ##########      #    #########',
        ' ########                  ##      ##     ## ###########',
        '     #####                 ##      ##     ### #####',
        '       #####               ##     ########   #####',
        '      #######              ##########   #  ########',
        '     ###########           ##    ##    # ###########',
        '      #############        ##    #   #############',
        '            ################################',
        '              ############################',
        '              #######  ##########  #######',
        '                ###      ######      ###',
        '                          ####',
      ],
    },
  }, {
    func: boot.printLines,
    params: {
      corruption: false,
      array: [
        'Connecting to HQ...',
        '...',
        '...',
        'Failed to connect to HQ',
        'Rerouting...',
      ],
    },
  }, {
    func: boot.printLines,
    params: {
      waitTime: 900,
      corruption: false,
      array: [
        'Connected!',
        'Welcome to the Oracle, employee UNDEFINED.',
        'May you have a productive day!',
        '',
        'Establishing uplink to relays...',
      ],
    },
  }, {
    func: boot.printLines,
    params: {
      waitTime: 3000,
      corruption: false,
      array: [
        'Uplink established!',
        'Downloading modules...',
        'LAMM  - LANTERN Amplification Master Manipulator',
        'OSAT  - Organica System Administrator Toolset',
        'CHAT  - Communication Host-Agent Tracker',
        'CREDS - Computer Registered Evaluative Decision System',
        'PANIC - PANIC-Assisted Neglect Information Collector',
        'YOU   - YOU Object Unifier',
        'Booting O3S 5.0...',
      ],
    },
  }, {
    func: boot.printLines,
    params: {
      classes: ['logo'],
      corruption: true,
      array: [
        'THIS RELEASE OF O3S WAS BROUGHT TO YOU BY',
        '   ####',
        '###############',
        ' #####  #########                                           ####',
        '  ####     #######  ########     ###########    ####     ###########',
        '  ####    ######      #######   ####   #####  ########    ####   #####',
        '  ####  ###         ####  ####        ####  ###    ###### ####   #####',
        '  #########        ####    ####     ####   #####     ##############',
        '  #### ######     ####     #####  ####     #######   ###  ########',
        '  ####   ######  ##### #### #### ############  #######    ####   ###',
        ' ######    #############    ################     ###      ####    #####',
        '########     ########        ####                        ######      #####   ##',
        '               ###########        ##                                    ###### ',
        '                    ###############',
        '                  Razor  #####  Demos - Warez - Honey',
        'ENJOY',
      ],
    },
  }, {
    func: boot.printLines,
    params: {
      corruption: false,
      array: [
        'Organica approved device detected!',
        'Rewriting firmware...',
        'Overriding lock...',
      ],
    },
  }, {
    func: boot.printLines,
    params: {
      corruption: false,
      array: [
        'Loading',
        '...',
        '...',
        '...',
        '...',
      ],
    },
  },
]);

if (!queryParameters.key && !queryParameters.mailEvent && !queryParameters.noBoot) {
  boot.appendTo(mainView);
}

soundLibrary.toggleSounds();

if (storageManager.getDeviceId() === null) {
  storageManager.setDeviceId(textTools.createAlphaNumbericalString(16));
}

window.addEventListener('error', (event) => {
  console.log(event.error);

  return false;
});

const terminal = new Terminal();
const toolsViewer = new ToolsViewer({ isFullscreen: true });
const home = new Home({
  introDevText: [
    elementCreator.createParagraph({
      text: 'THIS IS A DEVELOPMENT/EXPERIMENTAL SERVER. Stuff might be broken. Data might be lost. Save a copy of everything of importance',
    }),
    elementCreator.createParagraph({ text: 'Main developer: Aleksandar Jankovic' }),
    elementCreator.createParagraph({ text: 'More info at:' }),
    elementCreator.createLink({
      text: 'Patreon',
      href: 'http://patreon.com/yxeri',
      target: '_blank',
    }),
    elementCreator.createLink({
      text: 'Facebook',
      href: 'https://www.facebook.com/thethirdgiftgames/',
      target: '_blank',
    }),
    elementCreator.createParagraph({ text: 'This project is kept alive by your donations. Any small amount helps! Help support the project at ' }),
    elementCreator.createLink({
      text: 'Patreon',
      href: 'http://patreon.com/yxeri',
      target: '_blank',
    }),
    elementCreator.createParagraph({ text: 'Do you want to expand the world of BBR?' }),
    elementCreator.createLink({
      text: 'Join the cartographer group',
      href: 'https://www.facebook.com/groups/585709954945167/',
      target: '_blank',
    }),
    elementCreator.createParagraph({
      text: 'NOTE! Use Chrome on laptop/desktop/Android devices and Safari for Apple phone/tablet devices. It may not work properly in other browsers',
    }),
  ],
});
const messenger = new Messenger({ isFullscreen: true, sendButtonText: 'Send', isTopDown: false });
const dirViewer = new DirViewer({ isFullscreen: true });
const walletViewer = new Wallet();
const profile = new Profile();
const map = new WorldMap({
  mapView: WorldMap.MapViews.AREA,
  clusterStyle: {
    gridSize: 22,
    maxZoom: 17,
    zoomOnClick: false,
    singleSize: true,
    averageCenter: true,
    styles: [{
      width: 24,
      height: 24,
      iconAnchor: [12, 12],
      textSize: 12,
      url: 'images/mapcluster.png',
      textColor: '00ffcc',
      fontFamily: 'monospace',
    }],
  },
  mapStyles: [
    {
      featureType: 'all',
      elementType: 'all',
      stylers: [
        { color: '#11000f' },
      ],
    }, {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [
        { color: '#00ffcc' },
      ],
    }, {
      featureType: 'road',
      elementType: 'labels',
      stylers: [
        { visibility: 'off' },
      ],
    }, {
      featureType: 'poi',
      elementType: 'all',
      stylers: [
        { visibility: 'off' },
      ],
    }, {
      featureType: 'administrative',
      elementType: 'all',
      stylers: [
        { visibility: 'off' },
      ],
    }, {
      featureType: 'water',
      elementType: 'all',
      stylers: [
        { color: '#ff02e5' },
      ],
    },
  ],
  labelStyle: {
    fontFamily: 'monospace',
    fontColor: '#00ffcc',
    strokeColor: '#001e15',
    fontSize: 12,
  },
  mapBackground: '#11000f',
});
const teamViewer = new TeamViewer({ worldMap: map });
const tracker = new Tracker();

terminal.addCommand({
  commandName: 'calibrationAdjustment',
  accessLevel: 1,
  startFunc: () => {
    terminal.queueMessage({
      message: {
        text: [
          'Checking signal strength ...',
          'Retrieving station data ...',
        ],
      },
    });

    socketManager.emitEvent('getCalibrationMission', {}, ({ error, data }) => {
      if (error) {
        if (error.type === 'does not exist') {
          terminal.queueMessage({
            message: {
              text: [
                '-----',
                'ERROR',
                '-----',
                'No stations are in need of adjustments',
                'Aborting',
              ],
            },
          });
          terminal.resetNextFunc();

          return;
        } if (error.type === 'external') {
          terminal.queueMessage({
            message: {
              text: [
                '-----',
                'ERROR',
                '-----',
                'LANTERN activity is blocking calibration data',
                'Calibration adjustments are blocked',
              ],
            },
          });
          terminal.resetNextFunc();

          return;
        }

        terminal.queueMessage({
          message: {
            text: [
              '-----',
              'ERROR',
              '-----',
              'Something went wrong',
              'Unable to check for signal strength',
            ],
          },
        });
        terminal.resetNextFunc();

        return;
      }

      const { mission, isNew } = data;

      if (isNew) {
        terminal.queueMessage({
          message: {
            text: [
              'Signal strength is low!',
              'Station is in need of manual calibration',
            ],
          },
        });
      }

      terminal.queueMessage({
        message: {
          text: [
            `You have been assigned to calibrate station ${mission.stationId}`,
            `Proceed to station ${mission.stationId} and start the calibration process`,
            `Your assigned verification code is: ${mission.code}`,
            'END OF MESSAGE',
          ],
        },
      });

      terminal.resetNextFunc();
    });
  },
});
terminal.addCommand({
  commandName: 'hackLantern',
  accessLevel: 1,
  startFunc: () => {
    terminal.queueMessage({
      message: {
        text: [
          'Razor proudly presents:',
          'LANTERN Amplification Master Manipulator (LAMM)',
          'Overriding locks ...',
          'Connecting to database ...',
        ],
      },
    });

    socketManager.emitEvent('getLanternInfo', {}, ({ error, data: { teams, round, activeStations, inactiveStations, timeLeft } }) => {
      if (error) {
        terminal.queueMessage({
          message: {
            text: [
              '-----',
              'ERROR',
              '-----',
              'Something went wrong',
              'Unable to access LAMM',
            ],
          },
        });
        terminal.resetNextFunc();

        return;
      } else if (!round.isActive) {
        terminal.queueMessage({
          message: {
            text: [
              '-----',
              'ERROR',
              '-----',
              'No signal received',
              'Satellites are not in position',
              'Unable to target stations',
              `Next window opens in: ${timeLeft >= 0 ? timeLeft : 'UNKNOWN'}`,
              'Aborting LAMM',
            ],
          },
        });

        terminal.resetNextFunc();

        return;
      } else if (activeStations.length === 0) {
        terminal.queueMessage({
          message: {
            text: [
              '-----',
              'ERROR',
              '-----',
              'Unable to connect to stations',
              'No active stations found',
              'Unable to proceed',
              'Aborting LAMM',
            ],
          },
        });

        terminal.resetNextFunc();

        return;
      }

      terminal.queueMessage({
        message: {
          text: [
            '----',
            'LAMM',
            '----',
            'You will be shown a user with access to your chosen LANTERN',
            'Each user will have information about its password attached to it',
            'You must find the user\'s password within the dumps to get access to the LANTERN',
            'The password is repeated in both memory dumps',
            'We take no responsibility for deaths due to accidental activitation of defense systems',
            `Window closes in ${timeLeft >= 0 ? timeLeft : 'UNKNOWN'}`,
            '-----------------',
            'Choose a LANTERN:',
            '-----------------',
          ],
          elementPerRow: true,
          elements: activeStations.concat(inactiveStations).map((station) => {
            if (station.isActive) {
              const span = elementCreator.createSpan({});
              const stationSpan = elementCreator.createSpan({
                classes: ['clickable', 'linkLook', 'moreSpace'],
                text: `[${station.stationId}] ${station.stationName}`,
                func: () => {
                  terminal.triggerCommand(station.stationId);
                },
              });
              const ownerSpan = elementCreator.createSpan({
                text: `Owner: ${teams.find(team => team.teamId === station.owner) || '-'}`,
              });

              span.appendChild(stationSpan);
              span.appendChild(ownerSpan);

              return span;
            }

            return elementCreator.createSpan({
              text: `[INACTIVE] ${station.stationName}`,
            });
          }),
        },
      });

      terminal.setNextFunc((stationIdValue) => {
        const activeIds = activeStations.map(station => station.stationId);
        const stationId = !isNaN(stationIdValue) ? parseInt(stationIdValue, 10) : '';

        if (activeIds.indexOf(stationId) > -1) {
          const actions = [{ id: 1, name: 'Amplify' }, { id: 2, name: 'Dampen' }];

          terminal.queueMessage({
            message: {
              text: [
                '-----------------',
                'Choose an action:',
                '-----------------',
              ],
              elementPerRow: true,
              elements: actions.map((action) => {
                const span = elementCreator.createSpan({});
                const actionSpan = elementCreator.createSpan({
                  classes: ['clickable', 'linkLook', 'moreSpace'],
                  text: `[${action.id}] ${action.name}`,
                  func: () => {
                    terminal.triggerCommand(action.id);
                  },
                });

                span.appendChild(actionSpan);

                return span;
              }),
            },
          });

          terminal.setNextFunc((actionIdValue) => {
            const actionIds = actions.map(action => action.id);
            const actionId = !isNaN(actionIdValue) ? parseInt(actionIdValue, 10) : '';

            if (actionIds.indexOf(actionId) > -1) {
              terminal.queueMessage({
                message: {
                  text: [
                    `Action ${actions.find(action => action.id === actionId).name} chosen`,
                    `Accessing LANTERN ${stationId}...`,
                  ],
                },
              });

              socketManager.emitEvent('getLanternHack', { stationId }, ({ error: hackError, data: hackData }) => {
                if (hackError) {
                  terminal.queueMessage({ message: { text: ['Something went wrong. Failed to start hack'] } });
                  terminal.resetNextFunc();

                  return;
                }

                const boostingSignal = actionId === 1;
                const hintIndex = hackData.passwordHint.index + 1;

                const elements = textTools.createMixedArray({
                  classes: ['moreSpace'],
                  rowAmount: 15,
                  length: 34,
                  requiredClickableStrings: hackData.passwords,
                  charToLower: hackData.passwordHint.character,
                  requiredFunc: (value) => {
                    terminal.triggerCommand(value);
                  },
                });

                elements.forEach((element) => {
                  let startTouchTime;

                  element.addEventListener('touchstart', () => {
                    startTouchTime = new Date();
                  });

                  element.addEventListener('touchend', () => {
                    const endTouchTime = new Date();

                    if (endTouchTime - startTouchTime >= 300) {
                      const clickables = Array.from(element.getElementsByClassName('clickable'));

                      elements.forEach(spanElement => Array.from(spanElement.children).forEach(child => child.classList.remove('clickableRevealed')));
                      clickables.forEach(clickable => clickable.classList.add('clickableRevealed'));
                    }
                  });
                });

                terminal.queueMessage({
                  message: {
                    elementPerRow: true,
                    elements,
                  },
                });
                terminal.queueMessage({
                  message: {
                    text: [
                      '------------',
                      `User name: ${hackData.userName}`,
                      `Partial crack complete. The ${textTools.appendNumberSuffix(hintIndex)} character ${hackData.passwordHint.character}`,
                    ],
                  },
                });
                terminal.queueMessage({
                  message: {
                    text: [
                      `${hackData.triesLeft} tries left`,
                      '------------',
                    ],
                  },
                });

                terminal.setNextFunc((password) => {
                  socketManager.emitEvent('manipulateStation', { password: textTools.trimSpace(password), boostingSignal }, ({ error: manipulateError, data: manipulateData }) => {
                    if (manipulateError) {
                      terminal.queueMessage({ message: { text: ['Something went wrong. Failed to manipulate the LANTERN'] } });
                      terminal.resetNextFunc();

                      return;
                    }

                    const { success, triesLeft, matches, lockoutTime } = manipulateData;

                    if (success) {
                      terminal.queueMessage({
                        message: {
                          text: [
                            'Correct password',
                            `${boostingSignal ? 'Amplified' : 'Dampened'} LANTERN ${stationId} signal`,
                            'Thank you for using LAMM',
                          ],
                        },
                      });
                      terminal.resetNextFunc();
                    } else if (triesLeft <= 0) {
                      const beautifiedDate = textTools.generateTimeStamp({ date: lockoutTime });

                      terminal.queueMessage({
                        message: {
                          text: [
                            'Incorrect password',
                            `You have been locked out of LANTERN ${stationId}`,
                            'Starting lockdown crack',
                            `The lockdown lasts until ${beautifiedDate.fullTime} ${beautifiedDate.fullDate}`,
                            'Thank you for using LAMM',
                          ],
                        },
                      });
                      terminal.resetNextFunc();
                    } else {
                      terminal.queueMessage({ message: { text: [`Incorrect. ${matches.amount} matched. ${triesLeft} tries left`] } });
                    }
                  });
                });
              });
            } else {
              terminal.queueMessage({ message: { text: ['Incorrect action number'] } });
            }
          });
        } else {
          terminal.queueMessage({ message: { text: ['Incorrect station number'] } });
        }
      });
    });
  },
});
terminal.addCommand({
  commandName: 'credsCracker',
  accessLevel: 1,
  startFunc: () => {
    terminal.queueMessage({
      message: {
        text: [
          'Running Intrusive CREDS Extractor (ICE)',
          'Attempting connection to CRED server...',
          'Connection accepted!',
          'ICE activated',
          'Input the secret key',
        ],
      },
    });

    terminal.setNextFunc((secretKeyValue) => {
      socketManager.emitEvent('useGameCode', { code: secretKeyValue }, ({ error }) => {
        if (error) {
          console.log(error);
          terminal.resetNextFunc();

          return;
        }

        terminal.queueMessage({
          message: {
            text: [
              'Key is being process by ICE...',
              'Key accepted',
              'Creating transaction...',
              'Transaction created',
              'Generating new secret key for victim...',
              'ICE run completed',
              'Check your CREDS for transaction information',
            ],
          },
        });
        terminal.resetNextFunc();
      });
    });
  },
});
terminal.addCommand({
  commandName: 's1gn4lNuk3r',
  accessLevel: 1,
  startFunc: () => {
    const choices = [
      { value: '1', proceed: true },
      { value: '2', proceed: false },
    ];

    terminal.queueMessage({
      message: {
        text: [
          'WARNING WARNING WARNING',
          'This will jam the signal of all nearby devices, including yours.',
          'There is high risk of retaliation in the form of murder from nearby users.',
          'You are urged to leave the area after activation.',
          'The automated defense systems will track you.',
          'Do you wish to proceed?',
        ],
        elementPerRow: true,
        elements: [
          elementCreator.createSpan({
            classes: ['clickable', 'redButton'],
            text: '[1] LAUNCH',
            func: () => {
              terminal.triggerCommand('1');
            },
          }),
          elementCreator.createSpan({
            classes: ['clickable', 'linkLook', 'moreSpace'],
            text: '[2] No',
            func: () => {
              terminal.triggerCommand('2');
            },
          }),
        ],
      },
    });

    terminal.setNextFunc((choiceValue) => {
      const chosenChoice = choices.find(choice => choice.value === choiceValue);

      if (chosenChoice) {
        if (chosenChoice.proceed) {
          socketManager.emitEvent('signalBlock', { description: ['|\\||_||<3|>_by_'] }, ({ error }) => {
            if (error) {
              if (error.type === 'insufficient') {
                terminal.queueMessage({ message: { text: ['Unable to pinpoint your location', 'Unable to nuke the area'] } });
                terminal.resetNextFunc();

                return;
              }

              terminal.queueMessage({ message: { text: ['Something went wrong', 'Unable to nuke the area'] } });
              terminal.resetNextFunc();

              return;
            }

            terminal.resetNextFunc();
          });
        } else {
          terminal.queueMessage({ message: { text: ['Aborting'] } });
          terminal.resetNextFunc();
        }
      } else {
        terminal.queueMessage({ message: { text: ['Incorrect choice'] } });
      }
    });
  },
});

terminal.addTrigger({
  triggerName: 'calibrationMission',
  trigger: ({ mission }) => {
    if (mission.cancelled) {
      terminal.queueMessage({
        message: { text: ['CALIBRATION FAILED', 'Your calibration task was aborted', 'You will receive no payment'] },
      });
    } else {
      terminal.queueMessage({
        message: { text: ['CALIBRATION SUCCESSFUL', 'Your calibration task was successful', 'You have received your payment'] },
      });
    }
  },
});

// soundLibrary.addSound(new SoundElement({ path: '/sounds/msgReceived.wav', soundId: 'msgReceived' }));
// soundLibrary.addSound(new SoundElement({ path: '/sounds/button.wav', soundId: 'button', volume: 0.7 }));
// soundLibrary.addSound(new SoundElement({ path: '/sounds/button2.wav', soundId: 'button2' }));
// soundLibrary.addSound(new SoundElement({ path: '/sounds/fail.wav', soundId: 'fail' }));
// soundLibrary.addSound(new SoundElement({ path: '/sounds/keyInput.wav', soundId: 'keyInput', multi: true }));
// soundLibrary.addSound(new SoundElement({ path: '/sounds/topBar.wav', soundId: 'topBar' }));

mainView.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

top.addEventListener('click', () => {
  home.appendTo(mainView);
});

keyHandler.setTriggerKey(18); // Alt
keyHandler.addIgnoredKey(17); // Ctrl
keyHandler.addIgnoredKey(27); // Esc
keyHandler.addIgnoredKey(91); // Win/Cmd
keyHandler.addIgnoredKey(93); // Win/Cmd
keyHandler.addKey(32, () => { home.appendTo(mainView); });

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOS) {
  if (!viewTools.isLandscape()) {
    top.classList.add('appleMenuFix');
  }

  window.addEventListener('orientationchange', () => {
    if (viewTools.isLandscape()) {
      top.classList.remove('appleMenuFix');
    } else {
      top.classList.add('appleMenuFix');
    }
  });
}

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

home.addLink({
  linkName: 'login',
  startFunc: () => {
    new LoginBox({
      description: ['Welcome, employee! You have to login to begin your productive day!', 'All your actions in O3C will be monitored'],
      extraDescription: ['Input your user name and password', 'Allowed characters in the name: a-z 0-9'],
      parentElement: mainView,
      socketManager,
      keyHandler,
      closeFunc: () => { home.endLink('login'); },
    }).appendTo(mainView);
  },
  endFunc: () => {},
  accessLevel: 0,
  maxAccessLevel: 0,
  keepHome: true,
  classes: ['hide'],
  shortcut: true,
});
home.addLink({
  linkName: 'chat',
  startFunc: () => { messenger.appendTo(mainView); },
  endFunc: () => { messenger.removeView(); },
  shortcut: true,
});
home.addLink({
  linkName: 'tools',
  startFunc: () => { terminal.appendTo(mainView); },
  endFunc: () => { terminal.removeView(); },
  accessLevel: 1,
  classes: ['hide'],
  shortcut: true,
});
home.addLink({
  linkName: 'docs',
  startFunc: () => { dirViewer.appendTo(mainView); },
  endFunc: () => { dirViewer.removeView(); },
  shortcut: true,
});
home.addLink({
  linkName: 'maps',
  startFunc: () => { map.appendTo(mainView); },
  endFunc: () => { map.removeView(); },
  shortcut: true,
});
home.addLink({
  linkName: 'wallet',
  startFunc: () => { walletViewer.appendTo(mainView); },
  endFunc: () => { walletViewer.removeView(); },
  classes: ['hide'],
  accessLevel: 1,
  shortcut: true,
});
home.addLink({
  linkName: 'team',
  startFunc: () => { teamViewer.appendTo(mainView); },
  endFunc: () => { teamViewer.removeView(); },
  accessLevel: 1,
  classes: ['hide'],
  shortcut: true,
});
home.addLink({
  linkName: 'panic',
  startFunc: () => {
    const panicBox = new ButtonBox({
      description: [
        'Employee UNDEFINED. You have activate the PANIC-Assisted Neglect Information Collector (PANIC). Remain calm to minimize blood leakage and increase your survivability',
        'By proceeding, you agree to have your position retrieved and sent to those who can best help you',
        'Choose the option that best describes your current situation:',
        ' ',
        '"I\'m being murdered by a "',
      ],
      buttons: [
        elementCreator.createButton({
          text: 'Group of Panzerwolves',
          func: () => {
            const position = {
              coordinates: tracker.getBestPosition().coordinates,
              description: ['Panzerwolf raid'],
              markerType: 'ping',
              positionName: `${storageManager.getUserName()}-panic-ping`,
              isPublic: true,
              isStatic: true,
            };
            position.coordinates.radius = 90;

            socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
              if (error) {
                if (error.type === 'insufficient') {
                  panicBox.changeDescription({
                    text: [
                      'Unable to pinpoint your position',
                      'Thank you for using PANIC',
                    ],
                  });

                  panicBox.replaceButtons({
                    buttons: [
                      elementCreator.createButton({
                        text: 'Oh no...',
                        func: () => { panicBox.removeView(); },
                      }),
                    ],
                  });
                  return;
                }

                panicBox.removeView();

                return;
              }

              panicBox.changeDescription({
                text: [
                  'You have selected: "I\'m being murdered by a group of Panzerwolves"',
                  'The Organica corporation and the Panzerwolves have a written non-aggression pact',
                  'We recommend that you cite Agreement 233.75.1.12 to cease the murder process',
                  'A team of lawyers will be sent to your location',
                  'Thank you for using PANIC',
                ],
              });
              panicBox.replaceButtons({
                buttons: [
                  elementCreator.createButton({
                    text: 'Thank you!',
                    func: () => { panicBox.removeView(); },
                  }),
                ],
              });

              eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
            });
          },
        }),
        elementCreator.createButton({
          text: 'Organica re-education team',
          func: () => {
            const position = {
              coordinates: tracker.getBestPosition().coordinates,
              description: ['Organica företagsfest'],
              markerType: 'ping',
              positionName: `${storageManager.getUserName()}-panic-ping`,
              isPublic: true,
              isStatic: true,
            };
            position.coordinates.radius = 90;

            socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
              if (error) {
                if (error.type === 'insufficient') {
                  panicBox.changeDescription({
                    text: [
                      'Unable to pinpoint your position',
                      'Thank you for using PANIC',
                    ],
                  });

                  panicBox.replaceButtons({
                    buttons: [
                      elementCreator.createButton({
                        text: 'Oh no...',
                        func: () => { panicBox.removeView(); },
                      }),
                    ],
                  });
                  return;
                }

                panicBox.removeView();

                return;
              }

              panicBox.changeDescription({
                text: [
                  'You have selected: "I\'m being murdered by a Organica re-education"',
                  'You have been found in breach of your employment contract. Reason: {UNDEFINED}',
                  'Re-education is mandatory for low productivity and contract breaches',
                  'A second re-education team will be sent to your location to speed up the re-education process',
                  'Thank you for using PANIC',
                ],
              });
              panicBox.replaceButtons({
                buttons: [
                  elementCreator.createButton({
                    text: 'Thank you!',
                    func: () => { panicBox.removeView(); },
                  }),
                ],
              });

              eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
            });
          },
        }),
        elementCreator.createButton({
          text: 'Mugger with a gun and/or knife',
          func: () => {
            const userName = storageManager.getUserName();
            const position = {
              coordinates: tracker.getBestPosition().coordinates,
              description: [`${userName} under attack`],
              markerType: 'ping',
              positionName: `${storageManager.getUserName()}-panic-team-ping`,
              isPublic: false,
              isStatic: true,
            };
            position.coordinates.radius = 90;

            const team = storageManager.getTeam();

            if (team) {
              socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
                if (error) {
                  if (error.type === 'insufficient') {
                    panicBox.changeDescription({
                      text: [
                        'Unable to pinpoint your position',
                        'Thank you for using PANIC',
                      ],
                    });

                    panicBox.replaceButtons({
                      buttons: [
                        elementCreator.createButton({
                          text: 'Oh no...',
                          func: () => { panicBox.removeView(); },
                        }),
                      ],
                    });
                    return;
                  }

                  panicBox.removeView();

                  return;
                }

                panicBox.changeDescription({
                  text: [
                    'You have selected: "I\'m being murdered by a mugger with a gun and/or knife"',
                    'We have to remind you that allowing non-employees to take your assigned Organica equipment is a breech of your employment contract',
                    'We advice you to make certain that none of your equipment is stolen, before and after your death',
                    'Your location will be sent to your team',
                    'Thank you for using PANIC',
                  ],
                });
                panicBox.replaceButtons({
                  buttons: [
                    elementCreator.createButton({
                      text: 'Thank you!',
                      func: () => { panicBox.removeView(); },
                    }),
                  ],
                });

                eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions: [data.position] } });
              });
            } else {
              panicBox.changeDescription({
                text: [
                  'You have selected: "I\'m being murdered by a mugger with a gun and/or knife"',
                  'Warning! We have no record of you being part of a team',
                  'Only employees with the rank "Productive Team Member" or higher may use this service',
                  'No notification will be sent',
                  'Thank you for using PANIC',
                ],
              });
              panicBox.replaceButtons({
                buttons: [
                  elementCreator.createButton({
                    text: 'Oh no...',
                    func: () => { panicBox.removeView(); },
                  }),
                ],
              });
            }
          },
        }),
        elementCreator.createButton({
          text: '... Actually, I am fine',
          func: () => {
            panicBox.changeDescription({
              text: [
                'You have selected: "... Actually, I am fine"',
                'Warning! You have wasted seconds of Organica-owned time',
                'Your Good Employee Affirmation Rank (GEAR) has been reset to 0',
              ],
            });
            panicBox.replaceButtons({
              buttons: [
                elementCreator.createButton({
                  text: 'I will immediately sign up for voluntary re-education',
                  func: () => { panicBox.removeView(); },
                }),
              ],
            });
          },
        }),
      ],
    });
    panicBox.appendTo(mainView);
  },
  endFunc: () => {},
  accessLevel: 1,
  classes: ['hide'],
  keepHome: true,
  shortcut: true,
});
home.addLink({
  linkName: 'profile',
  startFunc: () => { profile.appendTo(mainView); },
  endFunc: () => { profile.removeView(); },
  accessLevel: 1,
  classes: ['hide'],
  shortcut: true,
});
home.addLink({
  linkName: 'support',
  startFunc: () => { toolsViewer.appendTo(mainView); },
  endFunc: () => { toolsViewer.removeView(); },
});
home.addLink({
  linkName: 'logout',
  startFunc: () => {
    socketManager.emitEvent('logout', { device: { deviceId: storageManager.getDeviceId() } }, (error) => {
      if (error) {
        console.log(error);
      }

      eventCentral.triggerEvent({ event: eventCentral.Events.LOGOUT });
      home.endLink('logout');
    });
  },
  accessLevel: 1,
  keepHome: true,
  classes: ['hide'],
  shortcut: true,
});

home.appendTo(mainView);

map.setCornerCoordinates(storageManager.getCornerOneCoordinates(), storageManager.getCornerTwoCoordinates());
map.setCenterCoordinates(storageManager.getCenterCoordinates());
map.setDefaultZoomLevel(storageManager.getDefaultZoomlevel());

eventCentral.addWatcher({
  watcherParent: this,
  event: eventCentral.Events.SIGNALBLOCK,
  func: ({ removeBlocker, blockedBy }) => {
    if (removeBlocker || !blockedBy) {
      storageManager.removeBlockedBy();
      signalBlockAnimation.end();

      return;
    }

    storageManager.setBlockedBy(blockedBy);

    signalBlockAnimation.setQueue([
      {
        func: signalBlockAnimation.printLines,
        params: {
          array: [
            '                            ..  .........',
            '                    `````..  ..        `````',
            '               .:.```````                  `.--`',
            '             ./:.--``..  ``                  `.:-',
            '            .-....---:--  ``       .`      ``..---`',
            '           `:://:/+/:-.  -.`               ``.-:/--',
            '            :::+oosso-  ``                ```.-:+/:`',
            '           `::oyhysso  ``               `  ```.:/+/-',
            '            --:/+/:..  ``                 `.  `.:/:`',
            '             ...```           ` `              ...',
            '                `````````.-`  +sh+.++.....``````',
            '                         .-...-//.::.',
            '                         -o+o::/o++-:',
            '         `````````````  .:://:::++o+/:`      ```````````..`',
            '     ..-::/osssyhy+o/..-/+oooosso+sso+::-...-/sys/:--:+oohh-.',
            '`.-/+ossyhhhmmMMMmysoosshhhdhhdNmhyhyssh++:-/+++:/+yssmNNmhyyy/',
            '`/+++++oyhyyhddhyoo///::////////::/++oo++os++oo+oosssssyhhhyyss:',
          ],
          waitTime: 3000,
          lineTime: 500,
          pre: true,
        },
      }, {
        func: signalBlockAnimation.printLines,
        params: {
          waitTime: 4000,
          corruption: false,
          array: [
            'ERROR',
            'Lost signal',
            'Attempting to reconnect...',
          ],
        },
      }, {
        func: signalBlockAnimation.printLines,
        params: {
          waitTime: 4000,
          corruption: false,
          array: [
            'Tracing jamming source...',
            'Tracking....',
            'Attempting to reconnect...',
          ],
        },
      }, {
        func: signalBlockAnimation.printLines,
        params: {
          waitTime: 4000,
          corruption: false,
          array: [
            'Source found!',
            `Source: user ${blockedBy}`,
          ],
        },
      }, {
        func: signalBlockAnimation.printLines,
        params: {
          waitTime: 6000,
          corruption: false,
          array: [
            'ERROR',
            'Unable to reconnect',
            'Attempting to reconnect...',
          ],
          repeatAmount: 16,
        },
      },
    ]);
    signalBlockAnimation.appendTo(mainView);
  },
});

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
      const { yearModification, centerLat, centerLong, cornerOneLat, cornerOneLong, cornerTwoLat, cornerTwoLong, defaultZoomLevel, mode } = data;
      storageManager.setYearModification(yearModification);
      storageManager.setCenterCoordinates(centerLong, centerLat);
      storageManager.setCornerOneCoordinates(cornerOneLong, cornerOneLat);
      storageManager.setCornerTwoCoordinates(cornerTwoLong, cornerTwoLat);
      storageManager.setDefaultZoomLevel(defaultZoomLevel);

      if (!socketManager.hasConnected) {
        new Clock(document.getElementById('time')).start();
        map.setCornerCoordinates(storageManager.getCornerOneCoordinates(), storageManager.getCornerTwoCoordinates());
        map.setCenterCoordinates(storageManager.getCenterCoordinates());
        map.setDefaultZoomLevel(storageManager.getDefaultZoomlevel());
      }

      eventCentral.triggerEvent({ event: eventCentral.Events.SERVERMODE, params: { mode } });

      onlineStatus.setOnline();
      map.startMap();
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
      eventCentral.triggerEvent({ event: eventCentral.Events.HISTORY, params: { roomName, messages, timeZoneOffset, anonymous, isWhisper, options: { printable: false } } });
    },
  }, {
    event: 'chatMsg',
    func: ({ data }) => {
      console.log('whisper', data);
      const { message, timeZoneOffset, isWhisper, roomName } = data;
      eventCentral.triggerEvent({ event: eventCentral.Events.CHATMSG, params: { roomName, message, isWhisper, timeZoneOffset, options: { printable: false } } });
    },
  }, {
    event: 'docFile',
    func: ({ data }) => {
      const { docFile } = data;
      eventCentral.triggerEvent({ event: eventCentral.Events.DOCFILE, params: { docFile } });
    },
  }, {
    event: 'logout',
    func: () => {
      eventCentral.triggerEvent({ event: eventCentral.Events.LOGOUT });
    },
  }, {
    event: 'bcastMsg',
    func: ({ data }) => {
      const { message } = data;
      eventCentral.triggerEvent({ event: eventCentral.Events.BCASTMSG, params: { message } });
    },
  }, {
    event: 'transaction',
    func: ({ data }) => {
      const { transaction, wallet } = data;
      eventCentral.triggerEvent({ event: eventCentral.Events.TRANSACTION, params: { transaction, wallet } });
    },
  }, {
    event: 'mapPositions',
    func: ({ data }) => {
      const { positions, currentTime, shouldRemove } = data;

      if (shouldRemove) {
        eventCentral.triggerEvent({ event: eventCentral.Events.REMOVEPOSITIONS, params: { positions } });
      } else {
        eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions, currentTime } });
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
      eventCentral.triggerEvent({ event: eventCentral.Events.TERMINAL, params: { mission } });
    },
  }, {
    event: 'follow',
    func: ({ data }) => {
      const { whisperTo, whisper, room, data: followData } = data;

      if (whisperTo) {
        room.roomName = followData.replace('-whisper-', ' <-> ');
      }

      eventCentral.triggerEvent({ event: eventCentral.Events.FOLLOWROOM, params: { room, whisper, data: followData } });
    },
  }, {
    event: 'unfollow',
    func: ({ data }) => {
      const { room } = data;
      eventCentral.triggerEvent({ event: eventCentral.Events.UNFOLLOWROOM, params: { room } });
    },
  }, {
    event: 'simpleMsg',
    func: ({ data }) => {
      const { simpleMsg } = data;
      eventCentral.triggerEvent({ event: eventCentral.Events.SIMPLEMSG, params: { simpleMsg } });
    },
  }, {
    event: 'gameCode',
    func: ({ data }) => {
      const { gameCode } = data;
      eventCentral.triggerEvent({ event: eventCentral.Events.GAMECODE, params: { gameCode } });
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
      const { round } = data;
      eventCentral.triggerEvent({
        event: eventCentral.Events.LANTERNROUND,
        params: { round },
      });
    },
  },
  // {
  //   event: 'roomFollower',
  //   func: ({ userName, roomName, isFollowing }) => {
  //
  //   },
  // }, {
  //   event: 'ban',
  //   func: () => {},
  // },
]);
