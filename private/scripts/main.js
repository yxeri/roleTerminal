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

// const worldMapHandler = require('./../library/WorldMapHandler');
const dataHandler = require('../library/data/DataHandler');

const element = document.getElementById('main');

const userList = new List({
  collector: dataHandler.users,
  shouldFocusOnClick: false,
  listItemFields: [
    { paramName: 'username' },
  ],
});
const roomList = new RoomList({});
const messageList = new MessageList({
  shouldSwitchRoom: true,
});
const docFileList = new DocFileList({});
const forumList = new ForumList({});
const positionList = new PositionList({
  positionTypes: ['world'],
});
const secondPositionList = new PositionList({
  positionTypes: ['world'],
});

const docFileView = new DocFileView({});
const forumView = new ForumView({});
const worldMapView = new WorldMapView({
  elementId: 'worldMap',
  positionTypes: ['world'],
});
const secondWorldMapView = new WorldMapView({
  elementId: 'secondWorldMap',
  positionTypes: ['world'],
  listId: positionList.getElementId(),
});

positionList.addToView({
  element,
});
secondPositionList.addToView({
  element,
});
worldMapView.addToView({
  element,
});
secondWorldMapView.addToView({
  element,
});
userList.addToView({
  element,
});
roomList.addToView({
  element,
});
messageList.addToView({
  element,
});
docFileList.addToView({
  element,
});
docFileView.addToView({
  element,
});
forumList.addToView({
  element,
});
forumView.addToView({
  element,
});

window.addEventListener('error', (event) => {
  element.appendChild(document.createTextNode(`<<ERROR>>${JSON.stringify(event)}`));

  return false;
});
