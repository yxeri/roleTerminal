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

import List from './List';
import MessageDialog from '../views/dialogs/MessageDialog';
import UserDialog from '../views/dialogs/UserDialog';

import dataHandler from '../../data/DataHandler';
import storageManager from '../../StorageManager';
import eventCentral from '../../EventCentral';
import textTools from '../../TextTools';
import userComposer from '../../data/composers/UserComposer';
import accessCentral from '../../AccessCentral';
import messageComposer from '../../data/composers/MessageComposer';
import teamComposer from '../../data/composers/TeamComposer';
import viewSwitcher from '../../ViewSwitcher';

export default class MessageList extends List {
  /**
   * MessageList constructor.
   * @param {Object} params Parameters.
   * @param {boolean} [params.multiRoom] Should messages from all rooms be retrieved and shown in the list?
   * @param {boolean} [params.shouldSwitchRoom] Should the messages only be retrieved from the user's current room?
   * @param {string} [params.roomId] Id of the room to retrieve messages from.
   * @param {string[]} [params.classes] CSS classes.
   * @param {string} [params.elementId] Id of the list element.
   */
  constructor({
    roomId,
    effect,
    corners,
    linkUser = true,
    hideDate = false,
    showTeam = true,
    fullDate = true,
    multiRoom = false,
    shouldSwitchRoom = false,
    whisperText = ' - ',
    roomLists = [],
    classes = [],
    elementId = `mList-${Date.now()}`,
  }) {
    const userItemField = {
      paramName: 'ownerAliasId',
      fallbackTo: 'ownerId',
      convertFunc: (objectId) => {
        const identity = userComposer.getIdentity({ objectId });

        if (identity) {
          const teamIds = identity.partOfTeams || [];
          const shortNames = teamIds.map((teamId) => { return teamComposer.getTeam({ teamId }).shortName; });

          let name = identity.username || identity.aliasName;

          if (showTeam && shortNames.length > 0) {
            name += `[${shortNames.join('/')}]`;
          }

          return name;
        }

        return objectId;
      },
    };

    if (linkUser) {
      userItemField.clickFuncs = {
        leftFunc: (message, event) => {
          if (!linkUser) {
            return;
          }

          const dialog = new UserDialog({ identityId: message.ownerAliasId || message.ownerId });

          dialog.addToView({ element: viewSwitcher.getParentElement() });
          event.stopPropagation();
        },
      };
    }

    const superParams = {
      elementId,
      effect,
      corners,
      imageInfo: {
        paramName: 'ownerAliasId',
        fallbackTo: 'ownerId',
        show: true,
        getImage: (identityId) => { return userComposer.getImage(identityId); },
      },
      collapseEqual: {
        paramName: 'ownerAliasId',
        fallbackTo: 'ownerId',
      },
      sorting: {
        paramName: 'customTimeCreated',
        fallbackParamName: 'timeCreated',
      },
      listItemClickFuncs: {
        onlyAppend: true,
        needsAccess: true,
        leftFunc: (objectId) => {
          const message = messageComposer.getMessage({ messageId: objectId });
          const {
            hasFullAccess,
          } = accessCentral.hasAccessTo({
            objectToAccess: message,
            toAuth: userComposer.getCurrentUser(),
          });

          if (hasFullAccess) {
            const messageDialog = new MessageDialog({
              messageId: message.objectId,
              text: message.text,
            });

            messageDialog.addToView({
              element: viewSwitcher.getParentElement(),
            });
          }
        },
      },
      shouldScrollToBottom: true,
      classes: classes.concat(['msgList']),
      dependencies: [
        dataHandler.users,
        dataHandler.rooms,
        dataHandler.aliases,
        dataHandler.teams,
      ],
      shouldFocusOnClick: false,
      collector: dataHandler.messages,
      fieldToAppend: 'text',
      shouldAppendImage: true,
      appendClasses: ['msgLine'],
      listItemFieldsClasses: ['msgInfo'],
      listItemFields: [
        userItemField,
        {
          paramName: 'customTimeCreated',
          fallbackTo: 'timeCreated',
          convertFunc: (date) => {
            const timestamp = textTools.generateTimestamp({ date });

            if (hideDate) {
              return timestamp.fullTime;
            }

            return fullDate
              ? `${timestamp.fullTime} ${timestamp.fullDate}`
              : `${timestamp.fullTime} ${timestamp.halfDate}`;
          },
        }, {
          classes: ['msgRoomName'],
          paramName: 'roomId',
          convertFunc: (objectId) => {
            const room = dataHandler.rooms.getObject({ objectId });

            if (!multiRoom) {
              return '';
            }

            if (room) {
              const { isWhisper, participantIds } = room;

              if (isWhisper) {
                const identities = userComposer.getWhisperIdentities({ participantIds });
                const firstName = identities[0].username || identities[0].aliasName;
                const secondName = identities[1].username || identities[1].aliasName;

                return identities.length > 0
                  ? `${firstName}${whisperText}${secondName}`
                  : '';
              }

              return room.roomName.slice(0, 24);
            }

            return objectId;
          },
        },
      ],
    };

    if (!multiRoom) {
      superParams.filter = {
        orCheck: true,
        rules: [
          { paramName: 'roomId', paramValue: roomId || storageManager.getCurrentRoom() },
          { paramName: 'roomId', paramValue: '111111111111111111111116' },
        ],
      };
    }

    super(superParams);

    this.onCreateFunc = ({ object }) => {
      this.roomLists.every((roomList) => {
        const rooms = roomList.getCollectorObjects();
        const foundRoom = rooms.find((room) => { return object.roomId === room.objectId; });

        if (foundRoom) {
          roomList.animateElement({ elementId: foundRoom.objectId });

          return false;
        }

        return true;
      });
    };
    this.roomLists = roomLists;
    this.roomId = roomId || this.getRoomId();
    this.multiRoom = multiRoom;

    if (shouldSwitchRoom) {
      eventCentral.addWatcher({
        event: eventCentral.Events.SWITCH_ROOM,
        func: ({ origin, room }) => {
          if (!origin || this.roomLists
            .map((roomList) => { return roomList.elementId; })
            .some((roomListId) => { return roomListId === origin; })
          ) {
            const parent = this.getParentElement();

            if (parent) {
              this.getParentElement().classList.remove('flash');
              this.getParentElement().classList.add('flash');

              setTimeout(() => {
                this.getParentElement().classList.remove('flash');
              }, 400);
            }

            this.showMessagesByRoom({ roomId: room.objectId });
          }
        },
      });
    }
  }

  showMessagesByRoom({ roomId }) {
    this.roomId = roomId;
    this.filter = { rules: [{ paramName: 'roomId', paramValue: roomId }] };

    if (!this.multiRoom) {
      this.filter.orCheck = true;
      this.filter.rules.push({ paramName: 'roomId', paramValue: '111111111111111111111116' });
    }

    this.appendList();
  }

  setRoomListId(id) {
    this.roomListId = id;
  }

  setRoomId(roomId) {
    this.roomId = roomId;
  }

  getRoomId() {
    return this.roomId || storageManager.getCurrentRoom();
  }
}
