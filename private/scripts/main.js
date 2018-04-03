require('../library/polyfills');

const List = require('../library/components/lists/List');
const MessageList = require('../library/components/lists/MessageList');
const RoomList = require('../library/components/lists/RoomList');
const DocFileList = require('../library/components/lists/DocFileList');
const ForumList = require('../library/components/lists/ForumList');
const DocFileView = require('../library/components/views/DocFileView');
const ForumView = require('../library/components/views/ForumView');
const WorldMapView = require('../library/components/views/WorldMapView');
const PositionList = require('../library/components/lists/PositionList');
const ViewWrapper = require('../library/components/ViewWrapper');
const LoginDialog = require('../library/components/views/dialogues/LoginDialog');
const RegisterDialog = require('../library/components/views/dialogues/RegisterDialog');

const dataHandler = require('../library/data/DataHandler');
const elementCreator = require('../library/ElementCreator');
const labelHandler = require('../library/labels/LabelHandler');
const socketManager = require('../library/SocketManager');

const element = document.getElementById('main');

const userList = new List({
  collector: dataHandler.users,
  shouldFocusOnClick: false,
  listItemFields: [
    { paramName: 'username' },
  ],
});
const roomList = new RoomList({
  elementId: 'first room',
});
const secondRoomList = new RoomList({
  elementId: 'second room',
});
const messageList = new MessageList({
  shouldSwitchRoom: false,
  roomId: '111111111111111111111110',
});
const secondMessageList = new MessageList({
  roomListId: secondRoomList.getElementId(),
  shouldSwitchRoom: true,
});
const docFileList = new DocFileList({});
const positionList = new PositionList({
  positionTypes: ['world'],
  elementId: 'list one',
});
const secondPositionList = new PositionList({
  positionTypes: ['world'],
  elementId: 'list two',
});
const docFileView = new DocFileView({});

const forumList = new ForumList({
  classes: ['feedList'],
});
const forumView = new ForumView({
  classes: ['feedView'],
});

// positionList.addToView({
//   element,
// });
// secondPositionList.addToView({
//   element,
// });
// userList.addToView({
//   element,
// });
// secondRoomList.addToView({
//   element,
// });
// secondMessageList.addToView({
//   element,
// });
// docFileList.addToView({
//   element,
// });
// docFileView.addToView({
//   element,
// });

const loginButton = elementCreator.createButton({
  text: 'login',
  clickFuncs: {
    leftFunc: () => {
      const login = new LoginDialog({});

      login.addToView({
        element,
      });
    },
  },
});
const registerButton = elementCreator.createButton({
  text: 'register',
  clickFuncs: {
    leftFunc: () => {
      const register = new RegisterDialog({});

      register.addToView({
        element,
      });
    },
  },
});
const logoutButton = elementCreator.createButton({
  text: 'logout',
  clickFuncs: {
    leftFunc: () => {
      socketManager.logout({
        callback: ({ error }) => {
          if (error) {
            console.log('Failed to logout');

            return;
          }

          console.log('Logged out');
        },
      });
    },
  },
});

element.appendChild(loginButton);
element.appendChild(registerButton);
element.appendChild(logoutButton);

const feedWrapper = new ViewWrapper({
  classes: ['feedWrapper'],
  columns: [
    [
      {
        component: forumList,
        title: labelHandler.getLabel({ baseObject: 'FeedView', label: 'messageListTitle' }),
      },
    ], [
      { component: forumView },
    ], [
      { component: messageList },
    ],
  ],
});

feedWrapper.addToView({
  element,
});

window.addEventListener('error', (event) => {
  element.appendChild(document.createTextNode(`<<ERROR>>${JSON.stringify(event)}`));

  return false;
});
