/*
 Copyright 2018 Carmilla Mina Jankovic

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

const BaseData = require('./BaseData');

const eventCentral = require('../EventCentral');
const { EmitTypes } = require('../SocketManager');

class InvitationData extends BaseData {
  constructor() {
    super({
      createEvents: {
        one: 'createInvitation',
      },
      retrieveEvents: {
        one: 'getInvitation',
        many: 'getInvitations',
      },
      updateEvents: {
        one: 'updateInvitation',
      },
      objectTypes: {
        one: 'invitation',
        many: 'invitations',
      },
      eventTypes: {
        one: eventCentral.Events.INVITATION,
        many: eventCentral.Events.INVITATIONS,
      },
      removeEvents: {
        one: 'removeInvitation',
      },
      emitTypes: [EmitTypes.INVITATION],
    });
  }
}

const invitationData = new InvitationData();

module.exports = invitationData;
