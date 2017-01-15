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

const SocketManager = require('../library/SocketManager');
const LoginBox = require('../library/view/templates/LoginBox');
const Messenger = require('../library/view/templates/Messenger');
const Message = require('../library/view/elements/Message');
const Time = require('../library/view/templates/Time');
const OnlineStatus = require('../library/view/templates/OnlineStatus');
const starter = require('../library/starter');
const storage = require('../library/storage');

const mainView = document.getElementById('main');
const onlineStatus = new OnlineStatus(document.getElementById('onlineStatus'));

const socketManager = new SocketManager({
  socket: io(), // eslint-disable-line no-undef
  events: {
    disconnect: () => {
      onlineStatus.setOffline();
    },
    reconnect: () => {
      onlineStatus.setOnline();
    },
    startup: ({ yearModification }) => {
      storage.setLocalVal('yearModification', yearModification);

      onlineStatus.setOnline();
      new Time(document.getElementById('time')).startClock();
    },
  },
});

const messenger = new Messenger({ isFullscreen: true, socketManager, sendButtonText: 'Skicka', isTopDown: false });
messenger.appendTo(mainView);

socketManager.addEvent('chatMsg', ({ message }) => {
  messenger.addMessage(message, { printable: true });
});

messenger.addMessages([
  new Message({
    time: new Date(2013, 6, 21, 23, 21, 0),
    text: ['Ryssland har invaderat. Explosioner i Stockholm, Göteborg, Malmö, Köpenhamn. Kommunikationsinfrastrukturen skadad. Totalförsvaret mobiliserat.'],
    userName: 'Centralen',
  }, { printable: false }),
  new Message({
    time: new Date(2013, 6, 22, 0, 2, 0),
    text: ['Kärnvapenexplosioner bekräftade i Stockholm, Göteborg, Malmö, Köpenhamn.'],
    userName: 'Centralen',
  }, { printable: false }),
  new Message({
    time: new Date(2014, 4, 14, 0, 0, 0),
    text: ['Tidfunktion trasig i systemet. Har ej tillgång till tekniker. Tappat kontakt med andra centraler.'],
    userName: 'Centralen',
  }, { printable: false }),
  new Message({
    time: new Date(2016, 1, 5, 0, 0, 0),
    text: ['Spridning av dödlig sjukdom. Leder till feber, utslag under armarna, hosta. Rekommenderar att undvika kontakt med andra människor.'],
    userName: 'Centralen',
  }, { printable: false }),
  new Message({
    time: new Date(2016, 1, 19, 0, 0, 0),
    text: ['Rosen är röd och nu är jag död.'],
    userName: 'Centralen',
  }, { printable: false }),
  new Message({
    time: new Date(2016, 1, 25, 0, 0, 0),
    text: ['HUVUDCENTRALEN HAR VARIT INAKTIV I 5 DAGAR. DETTA ÄR ETT AUTOMATISERAT MEDDELANDE'],
    userName: 'Centralen',
  }, { printable: false }),
  new Message({
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['Test test'],
    userName: 'OKÄND SÄNDARE',
  }, { printable: false }),
  new Message({
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['trst test med namn'],
    userName: 'Värnhem',
  }, { printable: false }),
  new Message({
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['Östbacken online. tidstämpeln verkar inte fungera. kommer försöka hämta gamla meddelanden'],
    userName: 'Östbacken',
  }, { printable: false }),
  new Message({
    time: new Date(2044, 9, 30, 12, 7, 0),
    text: ['Rifall är inkopplat. Jag fick igång tidstämpeln och har lyckats hämta några gamla meddelanden från "Centralen"'],
    userName: 'Rifall',
  }, { printable: false }),
]);

new LoginBox({
  descriptionText: 'Endast för Krismyndigheten och Försvarsmakten',
  parentElement: mainView,
  socketManager,
}).appendTo(mainView);

starter(socketManager);
