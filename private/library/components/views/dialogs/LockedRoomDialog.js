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

const BaseDialog = require('./BaseDialog');

const elementCreator = require('../../../ElementCreator');
const labelHandler = require('../../../labels/LabelHandler');
const roomComposer = require('../../../data/composers/RoomComposer');
const eventCentral = require('../../../EventCentral');

const ids = {
  PASSWORD: 'password',
};

class LockedRoomDialog extends BaseDialog {
  constructor({
    roomName,
    roomId,
    // listId,
    // listType,
    classes = [],
    elementId = `lRDialog-${Date.now()}`,
  }) {
    const upperText = [
      `${roomName} ${labelHandler.getLabel({ baseObject: 'LockedRoomDialog', label: 'isLocked', prependSpace: true })}`,
      `${labelHandler.getLabel({ baseObject: 'LockedRoomDialog', label: 'enterPassword' })}`,
    ];
    const inputs = [
      elementCreator.createInput({
        elementId: ids.PASSWORD,
        inputName: 'password',
        type: 'password',
        isRequired: true,
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'LockedRoomDialog', label: 'password' }),
      }),
    ];
    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => { this.removeFromView(); },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'LockedRoomDialog', label: 'unlock' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            roomComposer.follow({
              roomId,
              password: this.getInputValue(ids.PASSWORD),
              callback: ({ error }) => {
                if (error) {
                  this.updateLowerText({
                    text: [labelHandler.getLabel({ baseObject: 'LockedRoomDialog', label: 'accessDenied' })],
                  });

                  this.setInputValue({
                    elementId: ids.PASSWORD,
                    value: '',
                  });

                  return;
                }

                this.setInputValue({
                  elementId: ids.PASSWORD,
                  value: '',
                });

                this.removeFromView();

                eventCentral.emitEvent({
                  event: eventCentral.Events.FOLLOWED_ROOM,
                  params: {
                    room: { objectId: roomId },
                  },
                });
              },
            });
          },
        },
      }),
    ];

    super({
      elementId,
      inputs,
      lowerButtons,
      upperText,
      classes: classes.concat(['lockedRoomDialog']),
    });
  }
}

module.exports = LockedRoomDialog;
