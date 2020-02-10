const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');
const socketManager = require('../../SocketManager');
const storageManager = require('../../StorageManager');

class TeamComposer extends DataComposer {
  constructor() {
    super({
      handler: dataHandler.teams,
      completionEvent: eventCentral.Events.COMPLETE_TEAM,
      dependencies: [
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
      ],
    });
  }

  getTeam({ teamId }) {
    return this.handler.getObject({ objectId: teamId });
  }

  getTeamName({ teamId }) {
    const team = this.handler.getObject({ objectId: teamId });

    if (team) {
      return team.teamName;
    }

    return '';
  }

  createTeam({
    team,
    image,
    callback,
  }) {
    const teamToCreate = team;
    teamToCreate.ownerAliasId = storageManager.getAliasId();

    this.handler.createObject({
      callback,
      params: {
        image,
        team: teamToCreate,
      },
    });
  }

  leaveTeam({
    teamId,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      event: socketManager.EmitTypes.LEAVETEAM,
      params: { teamId },
    });
  }

  updateTeam({
    teamId,
    team,
    image,
    callback,
  }) {
    this.handler.updateObject({
      callback,
      params: {
        teamId,
        team,
        image,
      },
    });
  }

  getImage(teamId) {
    const team = this.getTeam({ teamId });

    if (team) {
      return team.image;
    }

    return undefined;
  }
}

const teamComposer = new TeamComposer();

module.exports = teamComposer;
