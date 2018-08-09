const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');

class InvitationComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.teams,
      completionEvent: eventCentral.Events.COMPLETE_INVITATION,
      dependencies: [
        dataHandler.invitations,
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
      ],
    });
  }

  inviteToTeam({
    teamId,
    memberId,
    callback,
  }) {
    const invitation = {
      itemId: teamId,
      receiverId: memberId,
    };

    this.handler.createObject({
      callback,
      event: socketManager.EmitTypes.INVITETEAM,
      params: { invitation },
    });
  }
}

const invitationComposer = new InvitationComposer();

module.exports = invitationComposer;
