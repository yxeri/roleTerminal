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
const Time = require('../library/view/templates/Clock');
const OnlineStatus = require('../library/view/templates/OnlineStatus');
const WorldMap = require('../library/view/worldMap/WorldMap');
const DirViewer = require('../library/view/templates/DirViewer');
const Home = require('../library/view/templates/Home');
const SoundElement = require('../library/audio/SoundElement');
const TextAnimation = require('../library/view/templates/TextAnimation');
const Profile = require('../library/view/templates/Profile');
const Wallet = require('../library/view/templates/Wallet');
const Terminal = require('../library/view/templates/Terminal');
const ButtonBox = require('../library/view/templates/ButtonBox');
const TeamViewer = require('../library/view/templates/TeamViewer');
const Tracker = require('../library/view/worldMap/Tracker');

const keyHandler = require('../library/KeyHandler');
const deviceChecker = require('../library/DeviceChecker');
const socketManager = require('../library/SocketManager');
const storageManager = require('../library/StorageManager');
const textTools = require('../library/TextTools');
const viewTools = require('../library/ViewTools');
const eventCentral = require('../library/EventCentral');
const soundLibrary = require('../library/audio/SoundLibrary');
const elementCreator = require('../library/ElementCreator');

const mainView = document.getElementById('main');
const top = document.getElementById('top');
const onlineStatus = new OnlineStatus(document.getElementById('onlineStatus'));

const boot = new TextAnimation({ removeTime: 3000 });
boot.setQueue([
  { func: boot.addCode, params: { iteration: 0, maxIteration: 12, row: 0, maxRows: 2 } },
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
  },
  {
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
  },
  {
    func: boot.printLines,
    params: {
      corruption: false,
      array: [
        'Connected!',
        'Welcome to the Oracle, employee UNDEFINED.',
        'May you have a productive day!',
        '',
        'Establishing uplink to relays...',
      ],
    },
  },
  { func: boot.addCode, params: { iteration: 0, maxIteration: 12, row: 0, maxRows: 2, binary: true } },
  {
    func: boot.printLines,
    params: {
      corruption: false,
      array: [
        'Uplink established!',
        'Booting OOC 5.0...',
      ],
    },
  },
  {
    func: boot.printLines,
    params: {
      classes: ['logo'],
      corruption: true,
      array: [
        'THIS RELEASE OF OOC WAS BROUGHT TO YOU BY',
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
  },
  {
    func: boot.printLines,
    params: {
      corruption: false,
      array: [
        'Organica approved device detected!',
        'Rewriting firmware...',
        'Overriding lock...',
      ],
    },
  },
  { func: boot.addCode, params: { iteration: 0, maxIteration: 12, row: 0, maxRows: 1 } },
  {
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
boot.appendTo(mainView);

soundLibrary.toggleSounds();

if (storageManager.getDeviceId() === null) {
  storageManager.setDeviceId(textTools.createAlphaNumbericalString(16, false));
}

window.addEventListener('error', (event) => {
  console.log(event.error);

  return false;
});

const terminal = new Terminal();

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
        console.log(error);
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
          'LANTERN Signal Manipulator (LSM)',
          'Please wait ...',
          'Intercepting command ...',
          'Disabling Oracle defense ...',
          'Overriding locks ...',
          'Connecting to database ...',
          'Welcome.',
          'We will retrieve two memory dumps for you. Within these dumps you will find one to many passwords',
          'You must find the true password within the dumps and use it together with a user name to get access to the LANTERN',
          'The true password is repeated in both memory dumps',
          'Our operatives have also gathered information about the users to help',
          'You will be shown users with access to your chosen LANTERN',
          'Each user will have information about its password attached to it, helping you figure out the true password',
          'You will have to use this information to filter out the true password in the memory dumps',
          'Finding the correct user name and password will give you access to a LANTERN',
          'We take no responsibility for deaths due to accidental activitation of defense systems',
        ],
      },
    });

    socketManager.emitEvent();
  },
});

const home = new Home();
const messenger = new Messenger({ isFullscreen: true, sendButtonText: 'Send', isTopDown: false });
const dirViewer = new DirViewer({ isFullscreen: true });
const wallet = new Wallet();
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

soundLibrary.addSound(new SoundElement({ path: '/sounds/msgReceived.wav', soundId: 'msgReceived' }));
soundLibrary.addSound(new SoundElement({ path: '/sounds/button.wav', soundId: 'button', volume: 0.7 }));
soundLibrary.addSound(new SoundElement({ path: '/sounds/button2.wav', soundId: 'button2' }));
soundLibrary.addSound(new SoundElement({ path: '/sounds/fail.wav', soundId: 'fail' }));
soundLibrary.addSound(new SoundElement({ path: '/sounds/keyInput.wav', soundId: 'keyInput', multi: true }));
soundLibrary.addSound(new SoundElement({ path: '/sounds/topBar.wav', soundId: 'topBar' }));

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
    storageManager.setRoom('public');
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

eventCentral.triggerEvent({
  event: eventCentral.Events.SWITCHROOM,
  params: { room: storageManager.getRoom() },
});

keyHandler.addKey(112, viewTools.goFullScreen);

window.addEventListener('click', () => {
  viewTools.goFullScreen();
});

if (!storageManager.getUserName()) {
  eventCentral.triggerEvent({ event: eventCentral.Events.LOGOUT });
}

home.addLink({
  linkName: 'login',
  startFunc: () => {
    new LoginBox({
      description: ['Welcome, employee! You have to login to begin your productive day!', 'All your actions in O3C will be monitored'],
      extraDescription: ['Input your user name and password'],
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
  linkName: 'panic',
  startFunc: () => {
    const panicBox = new ButtonBox({
      description: [
        'Employee UNDEFINED. You have pressed the panic button. Remain calm to minimize blood leakage and increase your survivability',
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

            socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
              if (error) {
                console.log(error);
                panicBox.removeView();

                return;
              }

              panicBox.changeDescription({
                text: [
                  'You have selected: "I\'m being murdered by a group of Panzerwolves"',
                  'The Organica corporation and the Panzerwolves have a written non-aggression pact',
                  'We recommend that you cite Agreement 233.75.1.12 to cease the murder process',
                  'A team of lawyers will be sent to your location',
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

            socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
              if (error) {
                console.log(error);
                panicBox.removeView();

                return;
              }

              panicBox.changeDescription({
                text: [
                  'You have selected: "I\'m being murdered by a Organica re-education"',
                  'You have been found in breach of your employment contract. Reason: {UNDEFINED}',
                  'Re-education is mandatory for low productivity and contract breaches',
                  'A second re-education team will be sent to your location to speed up the re-education process',
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

            const team = storageManager.getTeam();

            if (team) {
              socketManager.emitEvent('updatePosition', { position }, ({ error, data }) => {
                if (error) {
                  console.log(error);
                  panicBox.removeView();

                  return;
                }

                panicBox.changeDescription({
                  text: [
                    'You have selected: "I\'m being murdered by a mugger with a gun and/or knife"',
                    'We have to remind you that allowing non-employees to take your assigned Organica equipment is a breech of your employment contract',
                    'We advice you to make certain that none of your equipment is stolen, before and after your death',
                    'Your location will be sent to your team',
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
                'We will fine you 100 credits. NaN has been deducted from your wallet',
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
  linkName: 'coms',
  startFunc: () => { messenger.appendTo(mainView); },
  endFunc: () => { messenger.removeView(); },
  shortcut: true,
});
home.addLink({
  linkName: 'map',
  startFunc: () => { map.appendTo(mainView); },
  endFunc: () => { map.removeView(); },
  shortcut: true,
});
home.addLink({
  linkName: 'dir',
  startFunc: () => { dirViewer.appendTo(mainView); },
  endFunc: () => { dirViewer.removeView(); },
  shortcut: true,
});
home.addLink({
  linkName: 'wallet',
  startFunc: () => { wallet.appendTo(mainView); },
  endFunc: () => { wallet.removeView(); },
  classes: ['hide'],
  accessLevel: 1,
  shortcut: true,
});
home.addLink({
  linkName: 'terminal',
  startFunc: () => { terminal.appendTo(mainView); },
  endFunc: () => { terminal.removeView(); },
  accessLevel: 1,
  classes: ['hide'],
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
  linkName: 'logout',
  startFunc: () => {
    socketManager.emitEvent('logout', {}, (error) => {
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
    func: ({ yearModification, centerLat, centerLong, cornerOneLat, cornerOneLong, cornerTwoLat, cornerTwoLong, defaultZoomLevel }) => {
      storageManager.setYearModification(yearModification);
      storageManager.setCenterCoordinates(centerLong, centerLat);
      storageManager.setCornerOneCoordinates(cornerOneLong, cornerOneLat);
      storageManager.setCornerTwoCoordinates(cornerTwoLong, cornerTwoLat);
      storageManager.setDefaultZoomLevel(defaultZoomLevel);
      onlineStatus.setOnline();

      if (!socketManager.hasConnected) {
        new Time(document.getElementById('time')).startClock();
        map.setCornerCoordinates(storageManager.getCornerOneCoordinates(), storageManager.getCornerTwoCoordinates());
        map.setCenterCoordinates(storageManager.getCenterCoordinates());
        map.setDefaultZoomLevel(storageManager.getDefaultZoomlevel());
      }

      socketManager.emitEvent('updateId', {
        user: { userName: storageManager.getUserName() },
        device: { deviceId: storageManager.getDeviceId() },
      }, ({ error, data = {} }) => {
        if (error) {
          return;
        }

        const userName = storageManager.getUserName();

        if ((userName && data.anonUser) || data.anonUser) {
          storageManager.removeUser();
          storageManager.setAccessLevel(0);
        } else {
          storageManager.setAccessLevel(data.user.accessLevel);
          storageManager.setAliases(data.user.aliases);
          storageManager.setTeam(data.user.team);
          storageManager.setShortTeam(data.user.shortTeam);
        }

        eventCentral.triggerEvent({ event: eventCentral.Events.USER, params: { changedUser: data.anonUser || userName !== data.user.userName, firstConnection: !socketManager.hasConnected } });
        socketManager.setConnected();
      });
    },
  }, {
    event: 'message',
    func: ({ message }) => {
      console.log(message);
    },
  }, {
    event: 'chatMsgs',
    func: ({ messages, room, whisper }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.CHATMSG, params: { whisper, room, messages, options: { printable: false } } });
    },
  }, {
    event: 'docFile',
    func: ({ docFile }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.DOCFILE, params: { docFile } });
    },
  }, {
    event: 'logout',
    func: () => {
      eventCentral.triggerEvent({ event: eventCentral.Events.LOGOUT });
    },
  }, {
    event: 'bcastMsg',
    func: ({ message }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.BCASTMSG, params: { message } });
    },
  }, {
    event: 'transaction',
    func: ({ transaction }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.TRANSACTION, params: { transaction } });
    },
  }, {
    event: 'mapPositions',
    func: ({ positions, currentTime }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.POSITIONS, params: { positions, currentTime } });
    },
  }, {
    event: 'terminal',
    func: (params) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.TERMINAL, params });
    },
  }, {
    event: 'follow',
    func: ({ room }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.FOLLOWROOM, params: { room } });
    },
  }, {
    event: 'unfollow',
    func: ({ room }) => {
      eventCentral.triggerEvent({ event: eventCentral.Events.UNFOLLOWROOM, params: { room } });
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
