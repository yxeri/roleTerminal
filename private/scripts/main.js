require('../library/polyfills');

const WorldMapView = require('../library/components/views/WorldMapView');
const WorldMapPage = require('../library/components/views/pages/WorldMapPage');
const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const DocFileView = require('../library/components/views/DocFileView');
const WalletView = require('../library/components/views/WalletView');
const TeamView = require('../library/components/views/TeamView');
const PeopleView = require('../library/components/views/PeopleView');
const TerminalView = require('../library/components/views/TerminalView');
const TextAnimation = require('../library/components/views/TextAnimation');
const SpoonyView = require('./SpoonyView');

const userComposer = require('../library/data/composers/UserComposer');
const positionTracker = require('../library/PositionTracker');
const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const voiceCommander = require('../library/VoiceCommander');
const labelHandler = require('../library/labels/LabelHandler');
const elementCreator = require('../library/ElementCreator');
const socketManager = require('../library/SocketManager');
const textTools = require('../library/TextTools');
const deviceChecker = require('../library/DeviceChecker');
const WreckingStatus = require('./WreckingStatus');
const eventCentral = require('../library/EventCentral');

labelHandler.setBaseLabel({
  name: 'spoony',
  object: {
    spoony: {
      en: '"I seek love!" Sticky Spoon Love Bureau will help you find love out in the wastelands.',
    },
    'spoony-describe': {
      en: 'Describe yourself in three words',
    },
    'spoony-twoCreatures': {
      en: 'Wolf or mutant?',
    },
    'spoony-twoItems': {
      en: 'Caps or Stråla?',
    },
    'spoony-std': {
      en: 'STDs?',
    },
    'spoony-space': {
      en: 'Flesh or cyber?',
    },
    'spoony-stone': {
      en: 'You find a lump of strange material. How do you identify it? By... Licking it? Knocking on it? Asking it? Throwing it?',
    },
  },
});

const organicaLogo = [
  { element: elementCreator.createSpan({ text: '                          ####', classes: ['pre'] }), fullscreen: true },
  { element: elementCreator.createSpan({ text: '                ####    #########    ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '               ###########################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '              #############################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '            #######        ##   #  ##########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '      ##########           ##    #  ###  ##########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     #########             #########   #   #########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '       #####               ##     ########   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     #####                 ##     ##     ##########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     ####                  ##      ##     #   ######', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' #######                   ##########     ##    ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########                   ##       ########     ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' ######    O̶r̶g̶a̶n̶i̶c̶a RAZOR  ##       #      #############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '   ####   Oracle           ##       #      ##     ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '   ####   Operating        ##       #      ##    #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '   ####    System          ##       #      ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########                   ##       #########    ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########                   ##########      #    #########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' ########                  ##      ##     ## ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     #####                 ##      ##     ### #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '       #####               ##     ########   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '      #######              ##########   #  ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '     ###########           ##    ##    # ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '      #############        ##    #   #############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '            ################################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '              ############################', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '              #######  ##########  #######', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '                ###      ######      ###', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '                          ####', classes: ['pre'] }), afterTimeout: 2000 },
];
const razorLogo = [
  { element: elementCreator.createSpan({ text: '   ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '###############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' #####  #########                                           ####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####     #######  ########     ###########    ####     ###########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####    ######      #######   ####   #####  ########    ####   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####  ###         ####  ####        ####  ###    ###### ####   #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  #########        ####    ####     ####   #####     ##############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  #### ######     ####     #####  ####     #######   ###  ########', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '  ####   ######  ##### #### #### ############  #######    ####   ###', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: ' ######    #############    ################     ###      ####    #####', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '########     ########        ####                        ######      #####   ##', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '               ###########        ##                                    ###### ', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '                    ###############', classes: ['pre'] }) },
  { element: elementCreator.createSpan({ text: '#RAZOR# Demos - Warez - Honey' }), afterTimeout: 2000 },
];

const worldMapParams = {
  alwaysShowLabels: {
    line: true,
  },
  maxZoom: 19,
  clusterStyle: {
    gridSize: 10,
    maxZoom: 15,
    styles: [{
      width: 24,
      height: 24,
      iconAnchor: [12, 12],
      textSize: 12,
      url: 'images/mapcluster.png',
      textColor: '#ff00d7',
      fontFamily: 'monospace',
    }],
  },
  labelStyle: {
    fontColor: '#00ffef',
    minZoomLevel: 18,
    fontSize: 11,
  },
  backgroundColor: '#23001e',
  positionTypes: [
    'user',
    'device',
    'lantern',
    'local',
    'world',
    'roads',
    'drivable-roads',
  ],
  polygonStyle: {
    strokeColor: '#00ffef',
    fillColor: '#ff00d7',
    opacity: 1,
    strokeOpacity: 1,
    fillOpacity: 1,
    strokeWeight: 1.5,
  },
  markerStyle: {
    opacity: 0.9,
    icon: {
      url: '/images/mapicon.png',
    },
  },
  triggeredStyles: {
    markers: [{
      paramName: 'positionName',
      type: 'string',
      value: 'Sticky Spoon Love Bureau',
      style: {
        icon: {
          url: '/images/heart.png',
        },
      },
    }],
    polygons: [{
      paramName: 'description',
      type: 'array',
      minLength: 1,
      style: {
        strokeColor: '#ff00d7',
        fillColor: '#00ffef',
        styleName: 'Occupied',
      },
    }],
  },
  showLabelRules: {
    polygons: [{
      paramName: 'description',
      type: 'array',
      minLength: 1,
    }],
  },
  markedStyles: {
    polygons: {
      strokeColor: '#009100',
      fillColor: '#009100',
      styleName: 'Marked',
    },
  },
  choosableStyles: {
    markers: [{
      styleName: 'Red',
      icon: {
        url: '/images/mapicon-red.png',
      },
    }, {
      styleName: 'Green',
      icon: {
        url: '/images/mapicon-green.png',
      },
    }],
    polygons: [{
      strokeColor: '#ff0001',
      fillColor: '#ff0001',
      styleName: 'Red',
    }, {
      strokeColor: '#787878',
      fillColor: '#787878',
      styleName: 'Grey',
    }, {
      strokeColor: '#009100',
      fillColor: '#009100',
      styleName: 'Marked',
    }, {
      strokeColor: '#ff00d7',
      fillColor: '#00ffef',
      styleName: 'Occupied',
    }, {
      strokeColor: '#00ffef',
      fillColor: '#ff00d7',
      styleName: 'Not Occupied',
    }],
  },
  lineStyle: {
    strokeColor: '#ffffff',
    strokeWeight: 2,
  },
  mapStyles: [{
    elementType: 'geometry',
    stylers: [
      { color: '#23001e' },
    ],
  }, {
    elementType: 'labels',
    stylers: [
      { visibility: 'off' },
    ],
  }, {
    featureType: 'poi',
    stylers: [
      { visibility: 'off' },
    ],
  }, {
    featureType: 'administrative',
    stylers: [
      { color: '#57004a' },
    ],
  }, {
    featureType: 'landscape.natural.terrain',
    stylers: [
      { color: '#44003a' },
    ],
  }, {
    featureType: 'road',
    stylers: [
      { color: '#414141' },
      { weight: 0.5 },
    ],
  }, {
    featureType: 'transit',
    stylers: [
      { visibility: 'off' },
    ],
  }, {
    featureType: 'water',
    stylers: [
      { color: '#7d006c' },
    ],
  }],
  lists: [{
    elementId: 'housingList',
    title: 'Housing',
    positionTypes: ['local'],
    effect: true,
    zoomLevel: 18,
  }, {
    elementId: 'lanternList',
    title: 'LANTERN',
    positionTypes: ['lantern'],
    effect: true,
    zoomLevel: 16,
  }, {
    elementId: 'userList',
    title: 'Users',
    positionTypes: ['user'],
    effect: true,
    listItemFields: [{
      paramName: 'objectId',
      convertFunc: (objectId) => {
        const name = userComposer.getIdentityName({ objectId });

        return name || objectId;
      },
    }],
    zoomLevel: 18,
  }, {
    elementId: 'worldList',
    title: 'World',
    positionTypes: ['world'],
    effect: true,
    zoomLevel: 10,
  }],
};
const chatView = new ChatView({
  allowImages: true,
  effect: true,
  placeholder: 'Alt+Enter to send message',
});
const docFileView = new DocFileView({
  effect: true,
});
const worldMapView = new WorldMapView(worldMapParams);
const walletView = new WalletView({
  effect: true,
});
const worldMapPage = new WorldMapPage(worldMapParams);
const teamView = new TeamView({
  effect: true,
});
const peopleView = new PeopleView({
  effect: true,
});
const spoonyView = new SpoonyView({});
const terminalView = new TerminalView({
  bootSequence: organicaLogo
    .concat([
      { element: elementCreator.createSpan({ text: 'O̶r̶g̶a̶n̶i̶c̶a RAZOR System Administrator Toolset' }) },
      { element: elementCreator.createSpan({ text: 'RSAT ACCESS AUTHENTICATION' }) },
      { element: elementCreator.createSpan({ text: 'PERMITTED ONLY BY AUTHORIZED PERSONNEL' }), afterTimeout: 1000 },
      { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
      { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
      { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
      { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
      { element: elementCreator.createSpan({ text: 'ACCESS DENIED' }) },
      { element: elementCreator.createSpan({ text: 'Loading...' }), afterTimeout: 1000 },
      { element: elementCreator.createSpan({ text: 'ACCESS GRANTED' }) },
      { element: elementCreator.createSpan({ text: 'Welcome, administrator Charlotte Jenkins' }), afterTimeout: 1000 },
      { element: elementCreator.createSpan({ text: 'Your field report is -1 days late' }), afterTimeout: 1000 },
      { element: elementCreator.createSpan({ text: 'Oracle status: HQ CONNECTION FAILED' }) },
      { element: elementCreator.createSpan({ text: 'RSAT version: UNDEFINED' }) },
      { element: elementCreator.createSpan({ text: 'THIS RELEASE OF RSAT WAS BROUGHT TO YOU BY' }) },
    ], razorLogo, [
      { element: elementCreator.createSpan({ text: 'ENJOY' }) },
      { element: elementCreator.createSpan({ text: 'Loading...' }), afterTimeout: 2000 },
      { element: elementCreator.createSpan({ text: '...' }) },
      { element: elementCreator.createSpan({ text: '...' }) },
      { element: elementCreator.createSpan({ text: '...' }) },
      { element: elementCreator.createSpan({ text: '...' }) },
      { element: elementCreator.createSpan({ text: '...' }), fullscreen: false },
    ]),
});

terminalView.terminalPage.addCommand({
  commandName: 'lanternMaintenance',
  startFunc: () => {
    terminalView.terminalPage.queueMessages({
      objects: [
        { element: elementCreator.createSpan({ text: 'Artemisia needs your help to verify LANTERN operational status.' }) },
        { element: elementCreator.createSpan({ text: 'Downloading list of available LANTERNs ...' }) },
      ],
    });

    socketManager.emitEvent('getValidCalibrationStations', { userName: userComposer.getCurrentUser().username }, ({ error: stationError, data: stationData }) => {
      if (stationError) {
        if (stationError.type === 'does not exist') {
          terminalView.terminalPage.queueMessages({
            objects: [
              { element: elementCreator.createSpan({ text: '-----' }) },
              { element: elementCreator.createSpan({ text: 'ERROR' }) },
              { element: elementCreator.createSpan({ text: '-----' }) },
              { element: elementCreator.createSpan({ text: 'No LANTERNs are in need of maintenance' }) },
              { element: elementCreator.createSpan({ text: 'Aborting...' }) },
            ],
          });

          terminalView.terminalPage.resetNextFunc();

          return;
        }

        if (stationError.type === 'too frequent') {
          const timeText = stationError.extraData && typeof stationError.extraData.timeLeft === 'number'
            ? `${Math.abs(Math.ceil(stationError.extraData.timeLeft / 60000))}m`
            : 'UNKNOWN';

          terminalView.terminalPage.queueMessages({
            objects: [
              { element: elementCreator.createSpan({ text: '-----' }) },
              { element: elementCreator.createSpan({ text: 'ERROR' }) },
              { element: elementCreator.createSpan({ text: '-----' }) },
              { element: elementCreator.createSpan({ text: 'Data incomplete.' }) },
              { element: elementCreator.createSpan({ text: 'Data transfer is in progress.' }) },
              { element: elementCreator.createSpan({ text: `Expected completion in: ${timeText}.` }) },
              { element: elementCreator.createSpan({ text: 'Aborting...' }) },
            ],
          });

          terminalView.terminalPage.resetNextFunc();

          return;
        }

        terminalView.terminalPage.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'ERROR' }) },
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'Something went wrong' }) },
            { element: elementCreator.createSpan({ text: 'Unable to check LANTERN status.' }) },
            { element: elementCreator.createSpan({ text: 'Aborting...' }) },
          ],
        });

        terminalView.terminalPage.resetNextFunc();

        return;
      }

      if (stationData.mission) {
        const { mission } = stationData;

        terminalView.terminalPage.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: `You have been assigned LANTERN ${mission.stationId}` }) },
            { element: elementCreator.createSpan({ text: `Your assigned personal verification code is: ${mission.code}` }) },
            { element: elementCreator.createSpan({ text: `Proceed to LANTERN ${mission.stationId} and use the code` }) },
            { element: elementCreator.createSpan({ text: 'Artemisia wishes you a nice day!' }) },
            { element: elementCreator.createSpan({ text: 'END OF MESSAGE' }) },
          ],
        });

        terminalView.terminalPage.resetNextFunc();

        return;
      }

      const { stations } = stationData;

      terminalView.terminalPage.queueMessages({
        objects: [
          { element: elementCreator.createSpan({ text: '---------------------' }) },
          { element: elementCreator.createSpan({ text: 'Please select LANTERN' }) },
          { element: elementCreator.createSpan({ text: '---------------------' }) },
        ],
      });

      terminalView.terminalPage.queueMessages({
        objects: stations.map((station) => {
          const stationSpan = elementCreator.createSpan({
            classes: ['clickable'],
            text: `[${station.stationId}] ${station.stationName} - ${station.calibrationReward}vcaps`,
            clickFuncs: {
              leftFunc: () => {
                terminalView.terminalPage.triggerCommand(station.stationId);
              },
            },
          });

          return { element: stationSpan };
        }),
      });

      terminalView.terminalPage.setNextFunc((stationId) => {
        const stationIds = stations.map(station => station.stationId);
        const chosenStationId = !Number.isNaN(stationId)
          ? parseInt(stationId, 10)
          : '';

        if (stationIds.indexOf(chosenStationId) < 0) {
          terminalView.terminalPage.queueMessages({
            objects: [{ element: elementCreator.createSpan({ text: 'Incorrect LANTERN ID' }) }],
          });

          return;
        }

        socketManager.emitEvent('getCalibrationMission', { userName: userComposer.getCurrentUser().username, stationId: chosenStationId }, ({ error, data }) => {
          if (error) {
            if (error.type === 'does not exist') {
              terminalView.terminalPage.queueMessages({
                objects: [
                  { element: elementCreator.createSpan({ text: '-----' }) },
                  { element: elementCreator.createSpan({ text: 'ERROR' }) },
                  { element: elementCreator.createSpan({ text: '-----' }) },
                  { element: elementCreator.createSpan({ text: 'No LANTERN are in need of maintenance.' }) },
                  { element: elementCreator.createSpan({ text: 'Aborting...' }) },
                ],
              });
              terminalView.terminalPage.resetNextFunc();

              return;
            }

            if (error.type === 'external') {
              terminalView.terminalPage.queueMessages({
                objects: [
                  { element: elementCreator.createSpan({ text: '-----' }) },
                  { element: elementCreator.createSpan({ text: 'ERROR' }) },
                  { element: elementCreator.createSpan({ text: '-----' }) },
                  { element: elementCreator.createSpan({ text: 'LANTERN activity is blocking status data.' }) },
                  { element: elementCreator.createSpan({ text: 'Maintenance is blocked.' }) },
                  { element: elementCreator.createSpan({ text: 'Aborting...' }) },
                ],
              });
              terminalView.terminalPage.resetNextFunc();

              return;
            }

            terminalView.terminalPage.queueMessages({
              objects: [
                { element: elementCreator.createSpan({ text: '-----' }) },
                { element: elementCreator.createSpan({ text: 'ERROR' }) },
                { element: elementCreator.createSpan({ text: '-----' }) },
                { element: elementCreator.createSpan({ text: 'Something went wrong.' }) },
                { element: elementCreator.createSpan({ text: 'Unable to check for LANTERN status.' }) },
              ],
            });
            terminalView.terminalPage.resetNextFunc();

            return;
          }

          const { mission, isNew } = data;

          if (isNew) {
            terminalView.terminalPage.queueMessages({
              objects: [
                { element: elementCreator.createSpan({ text: 'LANTERN is need of maintenance!' }) },
              ],
            });
          }

          terminalView.terminalPage.queueMessages({
            objects: [
              { element: elementCreator.createSpan({ text: `You have been assigned LANTERN ${mission.stationId}` }) },
              { element: elementCreator.createSpan({ text: `Your assigned personal verification code is: ${mission.code}` }) },
              { element: elementCreator.createSpan({ text: `Proceed to LANTERN ${mission.stationId} and use the code` }) },
              { element: elementCreator.createSpan({ text: 'Artemisia wishes you a nice day!' }) },
              { element: elementCreator.createSpan({ text: 'END OF MESSAGE' }) },
            ],
          });

          terminalView.terminalPage.resetNextFunc();
        });
      });
    });
  },
});

terminalView.terminalPage.addCommand({
  commandName: 'hackLantern',
  startFunc: () => {
    terminalView.terminalPage.queueMessages({
      objects: [
        { element: elementCreator.createSpan({ text: 'RAZOR proudly presents:' }) },
        { element: elementCreator.createSpan({ text: 'LANTERN Amplification Master Manipulator (LAMM)' }) },
        { element: elementCreator.createSpan({ text: 'Overriding locks ...' }) },
        { element: elementCreator.createSpan({ text: 'Connecting to database ...' }) },
      ],
    });

    socketManager.emitEvent('getLanternInfo', {}, ({
      error,
      data,
    }) => {
      if (error) {
        terminalView.terminalPage.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'ERROR' }) },
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'Something went wrong' }) },
            { element: elementCreator.createSpan({ text: 'Unable to access LAMM' }) },
          ],
        });
        terminalView.terminalPage.resetNextFunc();

        return;
      }

      const {
        teams,
        round,
        activeStations,
        inactiveStations,
        timeLeft,
      } = data;

      if (!round.isActive) {
        const time = 0;
        const timeString = time > 0
          ? `${time} minutes`
          : 'UNKNOWN';

        terminalView.terminalPage.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'ERROR' }) },
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'No signal received.' }) },
            { element: elementCreator.createSpan({ text: 'Satellites are not in position.' }) },
            { element: elementCreator.createSpan({ text: 'Unable to target LANTERNs' }) },
            { element: elementCreator.createSpan({ text: `Next window opens in: ${timeString}` }) },
            { element: elementCreator.createSpan({ text: 'Aborting LAMM...' }) },
          ],
        });

        terminalView.terminalPage.resetNextFunc();

        return;
      }

      if (activeStations.length === 0) {
        terminalView.terminalPage.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'ERROR' }) },
            { element: elementCreator.createSpan({ text: '-----' }) },
            { element: elementCreator.createSpan({ text: 'Unable to connect to LANTERNs.' }) },
            { element: elementCreator.createSpan({ text: 'No active LANTERN found.' }) },
            { element: elementCreator.createSpan({ text: 'Unable to proceed.' }) },
            { element: elementCreator.createSpan({ text: 'Aborting LAMM...' }) },
          ],
        });

        terminalView.terminalPage.resetNextFunc();

        return;
      }

      const time = timeLeft;
      const timeString = time > 0
        ? `${time} minutes`
        : 'UNKNOWN';

      terminalView.terminalPage.queueMessages({
        objects: [
          { element: elementCreator.createSpan({ text: '----' }) },
          { element: elementCreator.createSpan({ text: 'LAMM' }) },
          { element: elementCreator.createSpan({ text: '----' }) },
          { element: elementCreator.createSpan({ text: 'You will be shown a user with access to your chosen LANTERN and a text dump.' }) },
          { element: elementCreator.createSpan({ text: 'Each user will have information about its password attached to it. Use it as a hint and try to find the correct password.' }) },
          { element: elementCreator.createSpan({ text: 'Each user might have more than one password, so don\'t blindly start clicking around. Check if the information corresponds to the password you are about to choose' }) },
          { element: elementCreator.createSpan({ text: 'You must find the user\'s password within the dumps to get access to the LANTERN. You will have 3 tries until the automated defense system shuts down the connection.' }) },
          { element: elementCreator.createSpan({ text: 'We take no responsibility for deaths due to accidental activitation of defense systems.' }) },
          { element: elementCreator.createSpan({ text: `Window closes in ${timeString}.` }) },
          { element: elementCreator.createSpan({ text: '-----------------' }) },
          { element: elementCreator.createSpan({ text: 'Choose a LANTERN:' }) },
          { element: elementCreator.createSpan({ text: '-----------------' }) },
        ],
      });

      terminalView.terminalPage.queueMessages({
        objects: activeStations.concat(inactiveStations).map((station) => {
          if (station.isActive) {
            const paragraph = elementCreator.createParagraph({});
            const stationSpan = elementCreator.createSpan({
              classes: ['clickable'],
              text: `[${station.stationId}] ${station.stationName}`,
              clickFuncs: {
                leftFunc: () => {
                  terminalView.terminalPage.triggerCommand(station.stationId);
                },
              },
            });
            const team = teams.find(foundTeam => foundTeam.teamId === station.owner);
            const ownerSpan = elementCreator.createSpan({
              text: `Owner: ${team
                ? team.teamName
                : '---'} ${station.isUnderAttack && team
                ? ' - UNDER ATTACK'
                : ''}`,
            });

            paragraph.appendChild(stationSpan);
            paragraph.appendChild(ownerSpan);

            return { element: paragraph };
          }

          return { element: elementCreator.createSpan({ text: `[INACTIVE] ${station.stationName}` }) };
        }),
      });

      terminalView.terminalPage.setNextFunc((stationIdValue) => {
        const activeIds = activeStations.map(station => station.stationId);
        const stationId = !Number.isNaN(stationIdValue)
          ? parseInt(stationIdValue, 10)
          : '';

        if (activeIds.indexOf(stationId) < 0) {
          terminalView.terminalPage.queueMessages({ objects: [{ element: elementCreator.createSpan({ text: 'Incorrect LANTERN number' }) }] });

          return;
        }

        const actions = [{ id: 1, name: 'Amplify' }, { id: 2, name: 'Dampen' }];

        terminalView.terminalPage.queueMessages({
          objects: [
            { element: elementCreator.createSpan({ text: '-----------------' }) },
            { element: elementCreator.createSpan({ text: 'Choose an action:' }) },
            { element: elementCreator.createSpan({ text: '-----------------' }) },
          ],
        });

        terminalView.terminalPage.queueMessages({
          objects: actions.map((action) => {
            const actionSpan = elementCreator.createSpan({
              classes: ['clickable'],
              text: `[${action.id}] ${action.name}`,
              clickFuncs: {
                leftFunc: () => {
                  terminalView.terminalPage.triggerCommand(action.id);
                },
              },
            });

            return { element: actionSpan };
          }),
        });

        terminalView.terminalPage.setNextFunc((actionIdValue) => {
          const actionIds = actions.map(action => action.id);
          const actionId = !Number.isNaN(actionIdValue)
            ? Number.parseInt(actionIdValue, 10)
            : '';

          if (actionIds.indexOf(actionId) > -1) {
            terminalView.terminalPage.queueMessages({
              objects: [
                { element: elementCreator.createSpan({ text: `Action ${actions.find(action => action.id === actionId).name} chosen.` }) },
                { element: elementCreator.createSpan({ text: `Accessing LANTERN ${stationId}...` }) },
              ],
            });

            socketManager.emitEvent('getLanternHack', { stationId }, ({ error: hackError, data: hackData }) => {
              if (hackError) {
                terminalView.terminalPage.queueMessages({ objects: [{ element: elementCreator.createSpan({ text: 'Something went wrong. Failed to start hack' }) }] });
                terminalView.terminalPage.resetNextFunc();

                return;
              }

              const boostingSignal = actionId === 1;
              const hintIndex = hackData.passwordHint.index + 1;

              const elements = textTools.createMixedArray({
                rowAmount: hackData.passwords.length,
                length: 34,
                requiredClickableStrings: hackData.passwords,
                charToLower: hackData.passwordHint.character,
                requiredFunc: (value) => {
                  terminalView.terminalPage.triggerCommand(value);
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

              terminalView.terminalPage.queueMessages({
                objects: elements.map((element) => {
                  return { element };
                }),
              });

              terminalView.terminalPage.queueMessages({
                text: [
                  { element: elementCreator.createSpan({ text: '------------' }) },
                  { element: elementCreator.createSpan({ text: `Username: ${hackData.userName}.` }) },
                  { element: elementCreator.createSpan({ text: `Partial crack complete. The ${textTools.appendNumberSuffix(hintIndex)} character ${hackData.passwordHint.character}.` }) },
                  { element: elementCreator.createSpan({ text: `${hackData.triesLeft} tries left` }) },
                  { element: elementCreator.createSpan({ text: '------------' }) },
                ],
              });

              terminalView.terminalPage.setNextFunc((password) => {
                socketManager.emitEvent('manipulateStation', { password: textTools.trimSpace(password), boostingSignal }, ({ error: manipulateError, data: manipulateData }) => {
                  if (manipulateError) {
                    terminalView.terminalPage.queueMessages({ objects: [{ element: elementCreator.createSpan({ text: 'Something went wrong. Failed to manipulate the LANTERN' }) }] });
                    terminalView.terminalPage.resetNextFunc();

                    return;
                  }

                  const { success, triesLeft, matches } = manipulateData;

                  if (success) {
                    terminalView.terminalPage.queueMessages({
                      objects: [
                        { element: elementCreator.createSpan({ text: 'Correct password' }) },
                        {
                          element: elementCreator.createSpan({
                            text: `${boostingSignal
                              ? 'Amplified'
                              : 'Dampened'} LANTERN ${stationId} signal`,
                          }),
                        },
                        { element: elementCreator.createSpan({ text: 'Thank you for using LAMM.' }) },
                      ],
                    });
                    terminalView.terminalPage.resetNextFunc();
                  } else if (triesLeft <= 0) {
                    terminalView.terminalPage.queueMessages({
                      objects: [
                        { element: elementCreator.createSpan({ text: 'Incorrect password.' }) },
                        { element: elementCreator.createSpan({ text: 'Unable to trigger action.' }) },
                        { element: elementCreator.createSpan({ text: 'Better luck next time!' }) },
                        { element: elementCreator.createSpan({ text: 'Thank you for using LAMM' }) },
                      ],
                    });
                    terminalView.terminalPage.resetNextFunc();
                  } else {
                    terminalView.terminalPage.queueMessages({ objects: [{ element: elementCreator.createSpan({ text: `Incorrect. ${matches.amount} matched. ${triesLeft} tries left` }) }] });
                  }
                });
              });
            });

            return;
          }

          terminalView.terminalPage.queueMessages({ objects: [{ element: elementCreator.createSpan({ text: 'Incorrect action number' }) }] });
        });
      });
    });
  },
});

const wreckingStatus = new WreckingStatus({ parent: viewSwitcher.getParentElement() });
const menuBar = new MenuBar({
  viewSwitcher,
  appendTop: false,
  showClock: true,
  showControls: {
    user: true,
    alias: true,
    currentUser: true,
    room: true,
    view: true,
    docFile: true,
  },
  elements: [
    elementCreator.createSpan({
      text: 'WRCK',
      classes: ['topMenuButton'],
      clickFuncs: {
        leftFunc: () => {
          wreckingStatus.element.classList.toggle('hide');
        },
      },
    }),
  ],
});
const docWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.DOCS,
  title: 'Docs',
  columns: [{
    components: [
      { component: docFileView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const chatWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.CHAT,
  title: 'Coms',
  columns: [{
    components: [
      { component: chatView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const fullMapWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.WORLDMAP,
  title: 'Maps',
  columns: [{
    components: [{ component: worldMapView }],
  }],
});
const walletWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.WALLET,
  title: 'Vcaps',
  columns: [{
    components: [
      { component: walletView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const teamWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.TEAM,
  title: 'Teams',
  columns: [{
    components: [
      { component: teamView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const peopleWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.PEOPLE,
  title: 'Employees',
  columns: [{
    components: [
      { component: peopleView },
    ],
  }, {
    components: [
      { component: worldMapPage },
    ],
  }],
});
const terminalWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.TERMINAL,
  title: 'Terminal',
  columns: [{
    components: [{ component: terminalView }],
  }, {
    components: [{ component: worldMapPage }],
  }],
});
const spoonyWrapper = new ViewWrapper({
  menuBar,
  viewType: 'spoony',
  title: 'Lovers',
  columns: [{
    components: [{ component: spoonyView }],
  }, {
    components: [{ component: worldMapPage }],
  }],
});

menuBar.setViews({
  viewSwitcher,
  views: [
    { view: chatWrapper },
    { view: docWrapper },
    { view: fullMapWrapper },
    { view: walletWrapper },
    { view: teamWrapper },
    { view: peopleWrapper },
    { view: terminalWrapper },
    { view: spoonyWrapper },
  ],
});

viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
    fullMapWrapper.viewType,
    walletWrapper.viewType,
    docWrapper.viewType,
    teamWrapper.viewType,
    peopleWrapper.viewType,
    terminalWrapper.viewType,
    spoonyWrapper.viewType,
  ],
});
viewSwitcher.setDefaultView({ view: chatWrapper });
viewSwitcher.switchView({
  setToDefault: true,
  view: chatWrapper,
});

if (!tools.getQueryParameters().noFullscreen) {
  document.addEventListener('click', () => {
    viewTools.goFullScreen({});
  });
}

// voiceCommander.start();
voiceCommander.addCommands({
  activationString: labelHandler.getLabel({ baseObject: 'VoiceCommands', label: 'viewSwitch' }),
  commands: [
    {
      strings: [
        'chat',
        'coms',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.CHAT }); },
    }, {
      strings: [
        'docs',
        'documents',
        'files',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.DOCS }); },
    }, {
      strings: [
        'map',
        'maps',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP }); },
    }, {
      strings: [
        'wallet',
        'vcaps',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WALLET }); },
    }, {
      strings: [
        'teams',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.TEAM }); },
    }, {
      strings: [
        'forum',
        'forums',
      ],
      func: () => { viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.FORUM }); },
    },
  ],
});

if (window.cordova) {
  document.addEventListener('deviceready', () => {
    StatusBar.hide(); // eslint-disable-line
    positionTracker.startTracker({ standalone: true });
  }, false);
} else {
  positionTracker.startTracker({});
}

if (deviceChecker.deviceType === deviceChecker.DeviceEnum.IOSOLD) {
  document.body.classList.add('oldIosFix');
}

const boot = new TextAnimation({
  messages: organicaLogo.concat([
    { element: elementCreator.createSpan({ text: 'Connecting to HQ...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Failed to connect to HQ' }) },
    { element: elementCreator.createSpan({ text: 'Rerouting...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Connected!' }) },
    { element: elementCreator.createSpan({ text: 'Welcome to the Oracle, employee UNDEFINED.' }) },
    { element: elementCreator.createSpan({ text: 'May you have a productive day!' }) },
    { element: elementCreator.createSpan({ text: '' }) },
    { element: elementCreator.createSpan({ text: 'Establishing uplink to relays...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'Uplink established!' }) },
    { element: elementCreator.createSpan({ text: 'Downloading modules...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'LAMM  - LANTERN Amplification Master Manipulator' }) },
    { element: elementCreator.createSpan({ text: 'RSAT  - O̶r̶g̶a̶n̶i̶c̶a RAZOR System Administrator Toolset' }) },
    { element: elementCreator.createSpan({ text: 'CHAT  - Communication Host-Agent Tracker' }) },
    { element: elementCreator.createSpan({ text: 'CREDS - Computer Registered Evaluative Decision System' }) },
    { element: elementCreator.createSpan({ text: 'YOU   - YOU Object Unifier' }) },
    { element: elementCreator.createSpan({ text: 'Booting O3S 7.1.3...' }), afterTimeout: 1000 },
    { element: elementCreator.createSpan({ text: 'THIS RELEASE OF O3S WAS BROUGHT TO YOU BY' }) },
  ], razorLogo, [
    { element: elementCreator.createSpan({ text: 'ENJOY' }) },
    { element: elementCreator.createSpan({ text: 'O̶r̶g̶a̶n̶i̶c̶a RAZOR approved device detected!' }) },
    { element: elementCreator.createSpan({ text: 'Rewriting firmware...' }) },
    { element: elementCreator.createSpan({ text: 'Overriding lock...' }) },
    { element: elementCreator.createSpan({ text: 'Loading' }), afterTimeout: 2000 },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
    { element: elementCreator.createSpan({ text: '...' }) },
  ]),
});

boot.addToView({ element: viewSwitcher.getParentElement() });

socketManager.addEvents([{
  event: 'lanternTeams',
  func: ({ data }) => {
    const { teams } = data;

    eventCentral.emitEvent({
      params: { teams },
      event: 'lanternTeams',
    });
  },
}, {
  event: 'lanternRound',
  func: ({ data }) => {
    const { round, timeLeft } = data;

    eventCentral.emitEvent({
      params: {
        round,
        timeLeft,
      },
      event: 'lanternRound',
    });
  },
}, {
  event: 'lanternStations',
  func: ({ data }) => {
    const { stations } = data;

    eventCentral.emitEvent({
      params: { stations },
      event: 'lanternStations',
    });
  },
}]);

socketManager.emitEvent('getLanternInfo', {}, ({ error, data }) => {
  if (error) {
    console.log('getLanternInfo', error);

    return;
  }

  const {
    teams,
    timeLeft,
    round,
    activeStations = [],
    inactiveStations = [],
  } = data;
  const stations = activeStations.concat(inactiveStations);

  eventCentral.emitEvent({
    params: { teams },
    event: 'lanternTeams',
  });

  eventCentral.emitEvent({
    params: {
      round,
      timeLeft,
    },
    event: 'lanternRound',
  });

  eventCentral.emitEvent({
    params: { stations },
    event: 'lanternStations',
  });
});
