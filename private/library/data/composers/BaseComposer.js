const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');

class BaseComposer {
  constructor({
    completionEvent,
    handler,
    dependencies = [],
  }) {
    this.isComplete = false;
    this.dependencies = dependencies;
    this.completionEvent = completionEvent;
    this.handler = handler;
    this.userHandler = dataHandler.users;

    this.checkIsComplete();
  }

  checkIsComplete() {
    if (!this.dependencies.every((dependency) => dependency.hasFetched)) {
      setTimeout(() => {
        this.checkIsComplete();
      }, 200);

      return;
    }

    this.isComplete = true;

    if (this.completionEvent) {
      eventCentral.emitEvent({
        event: this.completionEvent,
        params: {},
      });
    }
  }
}

module.exports = BaseComposer;
