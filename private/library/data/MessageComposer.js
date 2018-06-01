const DataComposer = require('./BaseComposer');

const dataHandler = require('./DataHandler');
const eventCentral = require('../EventCentral');
const storageManager = require('../StorageManager');

class MessageComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.messages,
      completionEvent: eventCentral.Events.COMPLETE_MESSAGE,
      dependencies: [
        dataHandler.messages,
        dataHandler.rooms,
        dataHandler.users,
        dataHandler.teams,
      ],
    });

    this.MessageTypes = {
      CHAT: 'chat',
      WHISPER: 'whisper',
      BROADCAST: 'broadcast',
      MESSAGE: 'message',
    };
  }

  getMessage({
    messageId,
  }) {
    const message = this.handler.getObject({ objectId: messageId });

    if (message) {
      message.creatorName = this.createCreatorName({ object: message });
    }

    return message;
  }

  sendMessage({
    message,
    callback,
  }) {
    const aliasId = storageManager.getAliasId();
    const messageToSend = message;

    if (aliasId) { messageToSend.ownerAliasId = aliasId; }

    this.handler.createObject({
      callback,
      params: { message },
    });
  }
}

const messageComposer = new MessageComposer();

module.exports = messageComposer;
