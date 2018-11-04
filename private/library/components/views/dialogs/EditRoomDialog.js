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

const ids = {
  ROOMNAME: 'roomName',
  PASSWORD: 'password',
};

class EditRoomDialog extends BaseDialog {
  constructor({
    roomId,
    classes = [],
    elementId = `eRDialog-${Date.now()}`,
  }) {
    const { roomName } = roomComposer.getRoom({ roomId });

    const inputs = [
      elementCreator.createInput({
        text: [roomName],
        elementId: ids.TITLE,
        inputName: 'roomName',
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'RoomDialog', label: 'roomName' }),
      }),
    ];

    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => {
            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'RoomDialog', label: 'changePassword' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new BaseDialog({
              inputs: [],
              lowerButtons: [
                elementCreator.createButton({
                  text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                  clickFuncs: {
                    leftFunc: () => {
                      this.removeFromView();
                    },
                  },
                }),
                elementCreator.createButton({
                  text: labelHandler.getLabel({ baseObject: 'RoomDialog', label: 'removePassword' }),
                  clickFuncs: {
                    leftFunc: () => {
                      this.removeFromView();
                    },
                  },
                }),
                elementCreator.createButton({
                  text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'change' }),
                  clickFuncs: {
                    leftFunc: () => {
                      this.removeFromView();
                    },
                  },
                }),
              ],
            });

            dialog.addToView({ element: this.getParentElement() });
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'change' }),
        clickFuncs: {
          leftFunc: () => {
            roomComposer.updateRoom({
              roomId,
              room: {
                roomName: this.getInputValue(ids.ROOMNAME),
              },
              callback: () => {
                this.removeFromView();
              },
            });
          },
        },
      }),
    ];

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'RoomDialog', label: 'roomInfo' })}`,
      '',
      `${labelHandler.getLabel({ baseObject: 'RoomDialog', label: 'roomName' })}: ${roomName}`,
    ];

    super({
      elementId,
      lowerButtons,
      upperText,
      inputs,
      classes: classes.concat(['editRoomDialog']),
    });
  }
}

module.exports = EditRoomDialog;
