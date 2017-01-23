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
const Time = require('../library/view/templates/Time');
const OnlineStatus = require('../library/view/templates/OnlineStatus');
const KeyHandler = require('../library/KeyHandler');
const storage = require('../library/storage');
const textTools = require('../library/textTools');

const mainView = document.getElementById('main');
const onlineStatus = new OnlineStatus(document.getElementById('onlineStatus'));
const isTouchDevice = navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iP(hone|ad|od)/i);

if (storage.getDeviceId() === null) {
  storage.setDeviceId(textTools.createAlphaNumbericalString(16, false));
}

if (!storage.getUserName()) {
  storage.setAccessLevel(0);
}

window.addEventListener('error', (event) => {
  /**
   * Reloads page
   * @private
   */
  function restart() {
    window.location.reload();
  }

  console.log(event.error);
  // setTimeout(restart, 3000);

  return false;
});

const socketManager = new SocketManager({ socket: io() }); // eslint-disable-line no-undef
const keyHandler = new KeyHandler();
const messenger = new Messenger({ isFullscreen: true, sendButtonText: 'Skicka', isTopDown: false, socketManager, keyHandler });

const goFullScreen = () => {
  const element = document.documentElement;

  if (element.requestFullscreen) {
    element.requestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
  }
};

keyHandler.addKey(112, goFullScreen);

if (isTouchDevice) {
  window.addEventListener('click', () => {
    goFullScreen();
  });
}

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
    func: ({ yearModification }) => {
      storage.setLocalVal('yearModification', yearModification);

      messenger.appendTo(mainView);

      onlineStatus.setOnline();
      new Time(document.getElementById('time')).startClock();

      socketManager.emitEvent('updateId', {
        user: { userName: storage.getUserName() },
        device: { deviceId: storage.getDeviceId() },
      }, ({ error, data = {} }) => {
        console.log(error, data);
        if (error) {
          return;
        }

        const userName = storage.getUserName();

        if (userName && data.anonUser) {
          new LoginBox({
            text: [
              'Endast för Krismyndigheten och Försvarsmakten',
              'Din användare kunde inte hittas i databasen',
              'Ni behöver registrera en ny användare',
            ],
            parentElement: mainView,
            socketManager,
            keyHandler,
          }).appendTo(mainView);
        } else if (data.anonUser) {
          new LoginBox({
            text: ['Endast för Krismyndigheten och Försvarsmakten'],
            parentElement: mainView,
            socketManager,
            keyHandler,
          }).appendTo(mainView);
        } else {
          console.log('I remember you');
        }

        socketManager.emitEvent('history', { lines: 10000 }, ({ data: historyData, historyError }) => {
          if (historyError) {
            console.log('history', historyError);

            return;
          }

          messenger.addMessages({ messages: historyData.messages, options: { printable: true }, shouldScroll: true });
        });
      });
    },
  }, {
    event: 'message',
    func: ({ message }) => {
      console.log(message);
    },
  }, {
    event: 'chatMsg',
    func: ({ message }) => {
      messenger.addMessage(message, { printable: true });
    },
  }, {
    event: 'chatMsgs',
    func: ({ messages }) => {
      messenger.addMessages({ options: { printable: true }, messages });
    },
  },
]);

messenger.addMessages({
  messages: [{
    time: new Date(2013, 6, 21, 23, 21, 0),
    text: ['Ryssland har invaderat. Explosioner i Stockholm, Göteborg, Malmö, Köpenhamn. Kommunikationsinfrastrukturen skadad. Totalförsvaret mobiliserat.'],
    userName: 'Centralen',
  }, {
    time: new Date(2013, 6, 22, 0, 2, 0),
    text: ['Kärnvapenexplosioner bekräftade i Stockholm, Göteborg, Malmö, Köpenhamn.'],
    userName: 'Centralen',
  }, {
    time: new Date(2014, 4, 14, 0, 0, 0),
    text: ['Tidfunktion trasig i systemet. Har ej tillgång till tekniker. Tappat kontakt med andra centraler.'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 5, 0, 0, 0),
    text: ['Spridning av dödlig sjukdom. Leder till feber, utslag under armarna, hosta. Rekommenderar att undvika kontakt med andra människor.'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 19, 0, 0, 0),
    text: ['Rosen är röd och nu är jag död.'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 25, 0, 0, 0),
    text: ['HUVUDCENTRALEN HAR VARIT INAKTIV I 5 DAGAR. DETTA ÄR ETT AUTOMATISERAT MEDDELANDE'],
    userName: 'Centralen',
  }, {
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['Test test'],
    userName: 'OKÄND SÄNDARE',
  }, {
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['trst test med namn'],
    userName: 'Värnhem',
  }, {
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['Östbacken online. tidstämpeln verkar inte fungera. kommer försöka hämta gamla meddelanden'],
    userName: 'Östbacken',
  }, {
    time: new Date(2044, 9, 30, 12, 7, 0),
    text: ['Rifall är inkopplat. Jag fick igång tidstämpeln och har lyckats hämta några gamla meddelanden från "Centralen"'],
    userName: 'Rifall',
  }],
  options: { printable: false },
  shouldScroll: true,
});
