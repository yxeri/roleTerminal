import DataComposer from './BaseComposer';

import {
  users,
  teams,
  aliases,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import socketManager from '../../SocketManager';
import storageManager from '../../StorageManager';

class TeamComposer extends DataComposer {
  constructor() {
    super({
      handler: teams,
      completionEvent: eventCentral.Events.COMPLETE_TEAM,
      dependencies: [
        users,
        teams,
        aliases,
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

  getTeams() {
    return this.handler.getObjects({});
  }
}

const teamComposer = new TeamComposer();

export default teamComposer;
