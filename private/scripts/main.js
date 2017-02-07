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
const MainMenu = require('../library/view/templates/MainMenu');
const keyHandler = require('../library/KeyHandler');
const deviceChecker = require('../library/DeviceChecker');
const socketManager = require('../library/SocketManager');
const storageManager = require('../library/StorageManager');
const textTools = require('../library/TextTools');
const viewTools = require('../library/ViewTools');
const eventCentral = require('../library/EventCentral');

const mainView = document.getElementById('main');
const top = document.getElementById('top');
const onlineStatus = new OnlineStatus(document.getElementById('onlineStatus'));

if (storageManager.getDeviceId() === null) {
  storageManager.setDeviceId(textTools.createAlphaNumbericalString(16, false));
}

if (!storageManager.getUserName()) {
  storageManager.setAccessLevel(0);
}

eventCentral.addWatcher({ watcherParent: this, event: eventCentral.Events.ALIAS, func: ({ aliases }) => { storageManager.setAliases(aliases); } });

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

const messenger = new Messenger({ isFullscreen: true, sendButtonText: 'Skicka', isTopDown: false });
const topMenu = new MainMenu({ parentElement: mainView });

topMenu.appendTo(top);

top.addEventListener('click', () => {
  topMenu.element.classList.toggle('hide');
});

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

keyHandler.addKey(112, viewTools.goFullScreen);

window.addEventListener('click', () => {
  viewTools.goFullScreen();
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
    func: ({ yearModification }) => {
      storageManager.setLocalVal('yearModification', yearModification);

      messenger.appendTo(mainView);
      onlineStatus.setOnline();
      new Time(document.getElementById('time')).startClock();

      socketManager.emitEvent('updateId', {
        user: { userName: storageManager.getUserName() },
        device: { deviceId: storageManager.getDeviceId() },
      }, ({ error, data = {} }) => {
        if (error) {
          return;
        }

        const userName = storageManager.getUserName();

        if (userName && data.anonUser) {
          storageManager.removeUser();

          new LoginBox({
            description: ['Endast för Krismyndigheten och Försvarsmakten'],
            extraDescription: [
              'Din användare kunde inte hittas i databasen',
              'Ni behöver registrera en ny användare',
            ],
            parentElement: mainView,
            socketManager,
            keyHandler,
          }).appendTo(mainView);
        } else if (data.anonUser) {
          new LoginBox({
            description: ['Endast för Krismyndigheten och Försvarsmakten'],
            extraDescription: ['Skriv in ert användarnamn och lösenord'],
            parentElement: mainView,
            socketManager,
            keyHandler,
          }).appendTo(mainView);
        } else {
          // TODO Duplicate code with LoginBox?
          storageManager.setAccessLevel(data.user.accessLevel);
          eventCentral.triggerEvent({ event: eventCentral.Events.ALIAS, params: { aliases: data.user.aliases } });
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
      messenger.addMessage({ message, options: { printable: true } });
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
    time: new Date(2013, 6, 26, 10, 0, 5),
    text: ['Uppsamlingsläger etablerade runt drabbade städer.'],
    userName: 'Centralen',
  }, {
    time: new Date(2014, 4, 14, 0, 0, 0),
    text: ['Tidfunktion trasig i systemet. Har ej tillgång till tekniker. Tappat kontakt med andra centraler.'],
    userName: 'Centralen',
  }, {
    time: new Date(2015, 6, 7, 0, 0, 0),
    text: ['Är någon kvar där ute?'],
    userName: 'Centralen',
  }, {
    time: new Date(2015, 11, 29, 0, 0, 0),
    text: ['Kontakt med uppsamlingslägrena fortfarande bruten. Ingen kontakt med militära styrkor. Ingen kontakt med civila grupper.'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 5, 0, 0, 0),
    text: ['PRIORITERAT MEDDELANDE. Spridning av dödlig sjukdom. Leder till feber, utslag under armarna, hosta. Rekommendation: undvik större grupperingar. Undvik kontakt med personer som uppvisar dessa symptom.'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 7, 0, 0, 0),
    text: ['Centralen är inte längre säker. Vi kommer att flytta till punkt 72C.'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 10, 0, 0, 0),
    text: ['omlokaliseringen misslyckades'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 16, 0, 0, 0),
    text: ['rosen ärröd oh nu är jag ddöd'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 1, 24, 0, 0, 0),
    text: ['HUVUDCENTRALEN HAR VARIT INAKTIV I 5 DAGAR. DETTA ÄR ETT AUTOMATISERAT MEDDELANDE'],
    userName: 'Centralen',
  }, {
    time: new Date(2016, 11, 14, 0, 0, 0),
    text: ['HUVUDCENTRALEN HAR VARIT INAKTIV I 300 DAGAR. DETTA ÄR ETT AUTOMATISERAT MEDDELANDE. DETTA ÄR ETT SLUTGILTIGT MEDDELANDE. CENTRALEN ÄR INAKTIV'],
    userName: 'Centralen',
  }, {
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['test test'],
    userName: 'OKÄND SÄNDARE',
  }, {
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['trst test med namn'],
    userName: 'Värnhem',
  }, {
    time: new Date(2044, 8, 10, 0, 0, 0),
    text: ['Östbacken inkopplade. Tiden fungerar inte'],
    userName: 'Östbacken',
  }, {
    time: new Date(2044, 9, 30, 12, 7, 0),
    text: ['Rifall är inkopplat. Jag fick igång tidstämpeln och har lyckats hämta några gamla meddelanden från "Centralen"'],
    userName: 'Rifall',
  }, {
    time: new Date(2044, 9, 30, 19, 0, 17),
    text: ['det här gjoirde vi bra'],
    userName: 'Värnhem',
  }, {
    time: new Date(2045, 2, 9, 10, 30, 6),
    text: ['Ledningen till Rifall är lagad, igen.'],
    userName: 'Rifall',
  }],
  options: { printable: false },
  shouldScroll: true,
});
