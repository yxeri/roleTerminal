const StandardView = require('../base/StandardView');
const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const storageManager = require('../../StorageManager');

class Profile extends StandardView {
  constructor() {
    super({ viewId: 'profile' });

    eventCentral.addWatcher({
      watcherParent: this,
      event: eventCentral.Events.USER,
      func: () => {
        this.element.innerHTML = '';

        const fragment = document.createDocumentFragment();
        fragment.appendChild(elementCreator.createParagraph({ text: `User: ${storageManager.getUserName() || '-'}` }));
        fragment.appendChild(elementCreator.createParagraph({ text: `Team: ${storageManager.getTeam() || '-'}` }));
        fragment.appendChild(elementCreator.createParagraph({ text: `Access level: ${storageManager.getAccessLevel()}` }));
        fragment.appendChild(elementCreator.createParagraph({ text: `DID: ${storageManager.getDeviceId()}` }));
        this.element.appendChild(fragment);
      },
    });
  }
}

module.exports = Profile;
