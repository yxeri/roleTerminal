const DataComposer = require('./BaseComposer');

const dataHandler = require('../DataHandler');
const eventCentral = require('../../EventCentral');

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
}

const teamComposer = new TeamComposer();

module.exports = teamComposer;
