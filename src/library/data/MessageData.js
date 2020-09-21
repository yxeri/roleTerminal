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

import BaseData from './BaseData';

import eventCentral from '../EventCentral';
import socketManager, { EmitTypes } from '../react/SocketManager';

class MessageData extends BaseData {
  constructor() {
    super({
      createEvents: {
        one: 'sendMessage',
      },
      retrieveEvents: {
        one: 'getMessage',
        many: 'getMessages',
      },
      updateEvents: {
        one: 'updateMessage',
      },
      objectTypes: {
        one: 'message',
        many: 'messages',
      },
      eventTypes: {
        one: eventCentral.Events.MESSAGE,
        many: eventCentral.Events.MESSAGES,
      },
      removeEvents: {
        one: 'removeMessage',
      },
      emitTypes: [
        EmitTypes.CHATMSG,
        EmitTypes.WHISPER,
        EmitTypes.BROADCAST,
      ],
    });

    socketManager.addEvent(EmitTypes.FOLLOW, ({ error, data }) => {
      if (error) {
        console.log('follow error', error);

        return;
      }

      const {
        room,
        invited,
      } = data;

      this.fetchObjects({
        event: EmitTypes.GETROOMMSGS,
        emitParams: { roomId: room.objectId },
        callback: ({ error: fetchError }) => {
          if (fetchError) {
            console.log(fetchError);

            return;
          }

          if (!invited) {
            eventCentral.emitEvent({
              event: eventCentral.Events.FOLLOWED_ROOM,
              params: {
                room,
                invited,
              },
            });
          }
        },
      });
    });
  }
}

const messageData = new MessageData();

export default messageData;
