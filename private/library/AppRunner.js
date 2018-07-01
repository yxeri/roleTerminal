const eventCentral = require('./EventCentral');

class AppRunner {
  constructor() {
    this.collectors = {};
    this.bootDone = false;
  }

  addCollector(collectorName) {
    this.collectors[collectorName] = { completed: false };
  }

  completeCollector(collectorName) {
    this.collectors[collectorName].completed = true;

    if (Object.keys(this.collectors).every(key => this.collectors[key].completed)) {
      eventCentral.emitEvent({
        event: eventCentral.Events.BOOT,
        params: {},
      });
    }
  }
}

const appRunner = new AppRunner();

module.exports = appRunner;
