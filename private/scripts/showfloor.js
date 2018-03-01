const socketManager = require('../library/SocketManager');
const elementCreator = require('../library/ElementCreator');
const eventCentral = require('../library/EventCentral');
const viewTools = require('../library/ViewTools');

const info = document.getElementById('info');
const wrecking = document.getElementById('wrecking');
const hacker = document.getElementById('hacker');
const active = document.getElementById('active');
let hackers = [];

const infoContainer = elementCreator.createContainer({});
infoContainer.appendChild(elementCreator.createParagraph({
  text: 'roleHaven är ett initiativ för att skapa en universal lajv-app. ' +
  'roleHaven är en samling av tillgängliga verktyg och spel för både arrangörer och deltagare.',
}));
infoContainer.appendChild(elementCreator.createParagraph({
  text: 'Ni kan testa appen på datorerna här eller genom att gå till' +
  ' bbrterminal.thethirdgift.com (Blodsband) eller tales.thethirdgift.com (Tales from the Sprawl)',
}));
infoContainer.appendChild(elementCreator.createParagraph({
  text: 'Vill ni veta mer? Besök på www.facebook.com/thethirdgiftgames/ eller www.patreon.com/yxeri. Ni kan kontakta utvecklaren, Aleksandar Jankovic, via aleks@thethirdgift.com.',
}));
info.appendChild(infoContainer);

const wreckingContainer = elementCreator.createContainer({ classes: ['wrecking'] });
wreckingContainer.appendChild(elementCreator.createParagraph({
  text: 'Blodsband Reloaded hade ett spelmoment som kallades "wrecking." ' +
  'Spelare hade då som mål att hacka via appen eller fånga stationer (vilket är lådan + parabolen som ni ser här bredvid, som skapats av arrangörerna av Blodsband) för att samla poäng. ' +
  'Under Prolog så kommer ni ha chans att testa både att fysiskt fånga stationen eller hacka den! En notis kommer att skrivas ut nedan när wreckingen är igång.',
}));
wrecking.appendChild(wreckingContainer);

const activeContainer = elementCreator.createContainer({});
activeContainer.appendChild(elementCreator.createParagraph({ classes: ['inactive'], text: 'Wrecking är inte aktiv.' }));

window.addEventListener('click', () => {
  viewTools.goFullScreen();
});

function buildStats(data) {
  const { round } = data;
  const element = elementCreator.createContainer({});

  if (!round.isActive) {
    element.appendChild(elementCreator.createParagraph({ classes: ['inactive'], text: 'Wrecking är inte igång.' }));
    hackers = [];
    hacker.innerHTML = '';
    hacker.appendChild(elementCreator.createContainer({}));
  } else {
    element.appendChild(elementCreator.createParagraph({
      classes: ['active'],
      text: 'Wrecking är igång! Ni kan delta som hacker genom appen eller gå till stationen (gråa lådan + parabol) för att fånga den. ' +
      'I appen: Gå till Home (första vyn. Den kan nås genom att klicka på toppraden). Klicka på PROGRAMS, hackLantern och följ sedan instruktionerna!',
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
