require('../library/polyfills');

const ViewWrapper = require('../library/components/ViewWrapper');
const ChatView = require('../library/components/views/ChatView');
const MenuBar = require('../library/components/views/MenuBar');
const TextAnimation = require('../library/components/views/TextAnimation');
const TargetDialog = require('../library/components/views/dialogs/TargetDialog');
const TemporaryDialog = require('../library/components/views/dialogs/TemporaryDialog');
const ConnectDialog = require('../library/components/views/dialogs/ConnectDialog');
const TeamScoreView = require('../library/components/views/TeamScoreView');
const TeamScorePage = require('../library/components/views/pages/TeamScorePage');

const viewTools = require('../library/ViewTools');
const viewSwitcher = require('../library/ViewSwitcher').setParentElement({ element: document.getElementById('main') });
const tools = require('../library/Tools');
const voiceCommander = require('../library/VoiceCommander');
const labelHandler = require('../library/labels/LabelHandler');
const elementCreator = require('../library/ElementCreator');
const socketManager = require('../library/SocketManager');
const deviceChecker = require('../library/DeviceChecker');
const mouseHandler = require('../library/MouseHandler');
const accessCentral = require('../library/AccessCentral');
const storageManager = require('../library/StorageManager');
const eventCentral = require('../library/EventCentral');

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

const chatView = new ChatView({
  allowImages: true,
  effect: true,
  placeholder: 'Alt+Enter to send message',
  roomListPlacement: 'hide',
  showTeam: false,
  linkUser: false,
  showInfo: false,
});
const teamScoreView = new TeamScoreView({});
const teamScorePage = new TeamScorePage({});
const targetButton = elementCreator.createSpan({
  text: 'TARGET',
  classes: ['topMenuButton'],
  clickFuncs: {
    leftFunc: () => {
      const dialog = new TargetDialog({});

      dialog.addToView({ element: viewSwitcher.getParentElement() });
    },
  },
});
const connectButton = elementCreator.createSpan({
  text: 'CONNECT',
  classes: ['topMenuButton'],
  clickFuncs: {
    leftFunc: () => {
      const dialog = new ConnectDialog({});

      dialog.addToView({});
    },
  },
});
const menuBar = new MenuBar({
  viewSwitcher,
  appendTop: false,
  showClock: false,
  showControls: {
    user: true,
    currentUser: false,
    view: true,
    register: false,
    teamProfile: false,
  },
  elements: [
    connectButton,
    targetButton,
  ],
});
accessCentral.addAccessElement({
  element: targetButton,
  minimumAccessLevel: 1,
});
accessCentral.addAccessElement({
  element: connectButton,
  minimumAccessLevel: 1,
});
const chatWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.CHAT,
  title: 'Chat',
  columns: [{
    components: [{ component: chatView }],
  }, {
    components: [{ component: teamScorePage }],
  }],
});
const teamScoreWrapper = new ViewWrapper({
  menuBar,
  viewType: viewSwitcher.ViewTypes.TEAMSCORE,
  title: 'Score',
  columns: [{
    components: [{ component: teamScoreView }],
  }],
});

menuBar.setViews({
  viewSwitcher,
  views: [
    { view: chatWrapper },
    { view: teamScoreWrapper },
  ],
});

viewSwitcher.addAvailableTypes({
  types: [
    chatWrapper.viewType,
    teamScoreWrapper.viewType,
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

// boot.addToView({ element: viewSwitcher.getParentElement() });

socketManager.addEvent(socketManager.EmitTypes.TERMINATE, () => {
  storageManager.resetUser();

  eventCentral.emitEvent({
    event: eventCentral.Events.LOGOUT,
    params: {},
  });

  const dialog = new TemporaryDialog({
    text: [labelHandler.getLabel({ baseObject: 'UserUpdate', label: 'terminated' })],
  });

  dialog.addToView({ element: viewSwitcher.getParentElement() });
});

mouseHandler.setAllowRightClick(true);
