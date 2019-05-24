/*
 Copyright 2019 Carmilla Mina Jankovic

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
const positionComposer = require('../../../data/composers/PositionComposer');

const ids = {
  EDITPOSITIONNAME: 'editPositionName',
  EDITPOSITIONDESCRIPTION: 'editPositionDescription',
  POSITIONTYPE: 'editPositionType',
  POSITIONPOINT: 'editPositionPoint',
  POSITIONCIRCLE: 'editPositionCircle',
  POSITIONLAT: 'positionLatitude',
  POSITIONLONG: 'positionLongitude',
};

class EditPositionDialog extends BaseDialog {
  constructor({
    positionId,
    classes = [],
    elementId = `posDialog-${Date.now()}`,
  }) {
    const position = positionComposer.getPosition({ positionId });
    const coordinates = position.coordinatesHistory[0];

    super({
      elementId,
      classes: classes.concat(['EditPositionDialog']),
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
          text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
          clickFuncs: {
            leftFunc: () => {
              const updatedPosition = {
                coordinates: {
                  longitude: parseFloat(this.getInputValue(ids.POSITIONLONG)),
                  latitude: parseFloat(this.getInputValue(ids.POSITIONLAT)),
                },
              };
              const description = this.getInputValue(ids.EDITPOSITIONDESCRIPTION);
              const positionName = this.getInputValue(ids.EDITPOSITIONNAME);

              if (positionName !== position.positionName) {
                updatedPosition.positionName = positionName;
              }

              if (description) {
                updatedPosition.description = description.split('\n');
              } else {
                updatedPosition.description = [];
              }

              positionComposer.updatePosition({
                positionId,
                position: updatedPosition,
                callback: ({ error }) => {
                  if (error) {
                    console.log('Edit position', error);

                    return;
                  }

                  this.removeFromView();
                },
              });
            },
          },
        }),
      ],
      inputs: [
        elementCreator.createInput({
          elementId: ids.EDITPOSITIONNAME,
          inputName: 'positionName',
          type: 'text',
          isRequired: true,
          placeholder: labelHandler.getLabel({ baseObject: 'MapObject', label: 'createPositionName' }),
          text: [position.positionName],
        }),
        elementCreator.createInput({
          elementId: ids.EDITPOSITIONDESCRIPTION,
          inputName: 'positionDescription',
          type: 'text',
          multiLine: true,
          placeholder: labelHandler.getLabel({ baseObject: 'MapObject', label: 'createPositionDescription' }),
          text: position.description
            ? position.description
            : undefined,
        }),
        elementCreator.createInput({
          elementId: ids.POSITIONLAT,
          inputName: 'latitude',
          type: 'text',
          isRequired: true,
          placeholder: 'latitude',
          text: [coordinates.latitude],
        }),
        elementCreator.createInput({
          elementId: ids.POSITIONLONG,
          inputName: 'longitude',
          type: 'text',
          isRequired: true,
          placeholder: 'longitude',
          text: [coordinates.longitude],
        }),
      ],
    });
  }
}

module.exports = EditPositionDialog;
