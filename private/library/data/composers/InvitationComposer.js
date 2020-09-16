import DataComposer from './BaseComposer';

import {
  invitations,
  users,
  teams,
  aliases,
} from '../DataHandler';
import eventCentral from '../../EventCentral';
import { EmitTypes } from '../../SocketManager';
import storageManager from '../../StorageManager';

class InvitationComposer extends DataComposer {
  constructor() {
    super({
      handler: teams,
      completionEvent: eventCentral.Events.COMPLETE_INVITATION,
      dependencies: [
        invitations,
        users,
        teams,
        aliases,
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
      event: EmitTypes.INVITETEAM,
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
      event: EmitTypes.SENDROOMINVITE,
    });
  }

  acceptTeam({
    teamId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      params: { itemId: teamId },
      event: EmitTypes.ACCEPTTEAM,
    });
  }

  acceptRoom({
    roomId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      params: { itemId: roomId },
      event: EmitTypes.ACCEPTROOM,
    });
  }

  decline({
    itemId,
    callback,
  }) {
    this.handler.removeObject({
      callback,
      event: EmitTypes.DECLINEINVITE,
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
