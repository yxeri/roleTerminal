const View = require('../base/View');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const storageManager = require('../../StorageManager');

class Profile extends View {
  constructor() {
    super({ viewId: 'profile' });

    this.element.appendChild(elementCreator.createContainer({}));
    this.element.appendChild(elementCreator.createContainer({}));

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        const fragment = document.createDocumentFragment();
        fragment.appendChild(elementCreator.createParagraph({ text: `User: ${storageManager.getUserName() || '-'}` }));
        fragment.appendChild(elementCreator.createParagraph({ text: `Team: ${storageManager.getTeam() || '-'}` }));
        fragment.appendChild(elementCreator.createParagraph({ text: `Device: ${storageManager.getDeviceId()}` }));

        this.element.firstElementChild.innerHTML = '';
        this.element.firstElementChild.appendChild(fragment);
      },
    });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.GAMECODE,
      func: ({ gameCode }) => {
        if (gameCode.codeType !== 'profile') {
          return;
        }

        const fragment = document.createDocumentFragment();

        fragment.appendChild(elementCreator.createParagraph({ text: '----KEY---' }));
        fragment.appendChild(elementCreator.createParagraph({ text: `| ${gameCode.code} |` }));
        fragment.appendChild(elementCreator.createParagraph({ text: '----END---' }));

        this.element.lastElementChild.innerHTML = '';
        this.element.lastElementChild.appendChild(fragment);
      },
    });
  }
}

module.exports = Profile;
