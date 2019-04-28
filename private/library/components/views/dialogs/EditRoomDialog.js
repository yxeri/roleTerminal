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
  REPEATPASSWORD: 'repeatPassword',
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
        elementId: ids.ROOMNAME,
        inputName: 'roomName',
        type: 'text',
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'RoomUpdateDialog', label: 'roomName' }),
      }),
      elementCreator.createInput({
        elementId: ids.PASSWORD,
        inputName: 'password',
        type: 'password',
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'RoomUpdateDialog', label: 'password' }),
      }),
      elementCreator.createInput({
        elementId: ids.REPEATPASSWORD,
        inputName: 'repeatPassword',
        type: 'password',
        maxLength: 40,
        placeholder: labelHandler.getLabel({ baseObject: 'RoomUpdateDialog', label: 'repeatPassword' }),
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
        text: labelHandler.getLabel({ baseObject: 'RoomDialog', label: 'removePassword' }),
        clickFuncs: {
          leftFunc: () => {
            roomComposer.resetPassword({
              roomId,
              callback: ({ error }) => {
                if (error) {
                  console.log(error);

                  return;
                }

                this.setInputValue({ elementId: ids.PASSWORD, value: '' });
                this.setInputValue({ elementId: ids.REPEATPASSWORD, value: '' });
              },
            });
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.getInputValue(ids.PASSWORD) !== '' && this.getInputValue(ids.PASSWORD) !== this.getInputValue(ids.REPEATPASSWORD)) {
              BaseDialog.markInput({ input: this.getElement(ids.PASSWORD) });
              BaseDialog.markInput({ input: this.getElement(ids.REPEATPASSWORD) });

              this.setInputValue({ elementId: ids.PASSWORD, value: '' });
              this.setInputValue({ elementId: ids.REPEATPASSWORD, value: '' });

              return;
            }

            roomComposer.updateRoom({
              roomId,
              room: {
                roomName: this.getInputValue(ids.ROOMNAME),
                password: this.getInputValue(ids.PASSWORD),
              },
              callback: ({ error }) => {
                if (error) {
                  console.log(error);

                  return;
                }

                this.removeFromView();
              },
            });
          },
        },
      }),
    ];

    const upperText = [
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
