const socketManager = require('../library/SocketManager');
const elementCreator = require('../library/ElementCreator');
const viewTools = require('../library/ViewTools');

const info = document.getElementById('info');
const wrecking = document.getElementById('wrecking');
const hacker = document.getElementById('hacker');
const active = document.getElementById('active');
let hackers = [];

const infoContainer = elementCreator.createContainer({});
infoContainer.appendChild(elementCreator.createParagraph({
  text: 'Rolehaven is an initiative to create a universal larp app. ' +
  'The app is a collection of tools and games for organisers and participants to use before, during and after the larp.',
}));
infoContainer.appendChild(elementCreator.createParagraph({
  text: 'You can try out the app on the computers here or visit' +
  ' bbrterminal.thethirdgift.com (Blodsband Reloaded. Mad Maxish) or tales.thethirdgift.com (Tales from the Sprawl. Cyberpunk, Shadowrun).',
}));
infoContainer.appendChild(elementCreator.createParagraph({
  text: 'Want to know more? Visit www.facebook.com/thethirdgiftgames/ or www.patreon.com/yxeri. You can get in touch with the developer, Aleksandar Jankovic, at aleks@thethirdgift.com.',
}));
info.appendChild(infoContainer);

const wreckingContainer = elementCreator.createContainer({ classes: ['wrecking'] });
wreckingContainer.appendChild(elementCreator.createParagraph({
  text: 'Blodsband Reloaded had a gameplay moment called "wrecking." ' +
  'The players were tasked with conquering and holding physical stations (created by the Blodsband organisers) in the game area. Those playing hackers would use the app to hack these stations to help/hinder those who held them. ' +
  'You can try it out yourself on the station (metal box) here when a wrecking round is active. A notice will be printed out here when a round is active.',
}));
wrecking.appendChild(wreckingContainer);

const activeContainer = elementCreator.createContainer({});
activeContainer.appendChild(elementCreator.createParagraph({ classes: ['inactive'], text: 'Wrecking is inactive.' }));

window.addEventListener('click', () => {
  viewTools.goFullScreen();
});

function buildStats(data) {
  const { round } = data;
  const element = elementCreator.createContainer({});

  if (!round.isActive) {
    element.appendChild(elementCreator.createParagraph({ classes: ['inactive'], text: 'Wrecking is inactive.' }));
    hackers = [];
    hacker.innerHTML = '';
    hacker.appendChild(elementCreator.createContainer({}));
  } else {
    element.appendChild(elementCreator.createParagraph({
      classes: ['active'],
      text: 'Wrecking is active! You can participate through the app or by going to the station (metal box). ' +
      'In the app: Go to the home view. You can reach it by clicking on the top, if not already there. Click on PROGRAMS, hackLantern and follow the instructions.',
    }));
    hackers = [];
    hacker.innerHTML = '';
    hacker.appendChild(elementCreator.createContainer({}));
  }

  active.replaceChild(element, active.firstElementChild);
}

socketManager.addEvents([
  {
    event: 'message',
    func: ({ data }) => {
      const { message } = data;

      if (message.lanternHack) {
        const hackerDiv = elementCreator.createContainer({});
        const span = elementCreator.createSpan({ text: message.text[0] });

        if (hackers.length === 3) {
          hackers.splice(0, 1);
        }

        hackers.push(span);

        hackers.forEach((hackerLine) => {
          hackerDiv.appendChild(hackerLine);
        });

        hacker.replaceChild(hackerDiv, hacker.firstElementChild);
      }
    }
  }, {
    event: 'disconnect',
    func: () => {
    },
  }, {
    event: 'reconnect',
    func: () => {
    },
  }, {
    event: 'lanternRound',
    func: ({ data }) => {
      buildStats(data);
    },
  },
]);

socketManager.emitEvent('updateId', {
  device: {
    deviceId: Date.now().toString().substring(0, 16),
  },
}, ({ error, data }) => {
  if (error) {
    console.log(error);

    return;
  }

  const { lanternStats } = data;
  console.log(lanternStats);

  buildStats(lanternStats);
});
