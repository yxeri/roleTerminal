import DataComposer from './BaseComposer';

import dataHandler from '../DataHandler';
import eventCentral from '../../EventCentral';
import socketManager from '../../SocketManager';
import storageManager from '../../StorageManager';

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

    this.InvitationTypes = {
      ROOM: 'room',
      TEAM: 'team',
    };
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

  inviteToRoom({
    roomId,
    followerIds,
    callback,
  }) {
    const params = {
      roomId,
      followerIds,
      aliasId: storageManager.getAliasId(),
    };

    this.handler.createObject({
      callback,
      params,
      event: socketManager.EmitTypes.SENDROOMINVITE,
    });
  }

  acceptTeam({
    teamId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      params: { itemId: teamId },
      event: socketManager.EmitTypes.ACCEPTTEAM,
    });
  }

  acceptRoom({
    roomId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      params: { itemId: roomId },
      event: socketManager.EmitTypes.ACCEPTROOM,
    });
  }

  decline({
    itemId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      event: socketManager.EmitTypes.DECLINEINVITE,
      paprams: { itemId },
    });
  }

  getInvitation({
    invitationId,
  }) {
    return this.handler.getObject({
      objectId: invitationId,
    });
  }

  getInvitations() {
    return this.handler.getObjects({});
  }

  getInvitationsByType({ type }) {
    return this.handler.getObjects({
      filter: {
        rules: [
          { paramName: 'invitationType', paramValue: type },
        ],
      },
    });
  }
}

const invitationComposer = new InvitationComposer();

export default invitationComposer;
