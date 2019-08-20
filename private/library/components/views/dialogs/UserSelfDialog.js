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
const userComposer = require('../../../data/composers/UserComposer');
const positionComposer = require('../../../data/composers/PositionComposer');
const eventCentral = require('../../../EventCentral');
const viewSwitcher = require('../../../ViewSwitcher');
const teamComposer = require('../../../data/composers/TeamComposer');
const storageManager = require('../../../StorageManager');

const ids = {
  PICTURE: 'picture',
  DESCRIPTION: 'description',
};

class UserSelfDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `uDialog-${Date.now()}`,
  }) {
    const user = userComposer.getCurrentUser();
    const {
      image,
      partOfTeams,
      fullName,
      username,
      description,
      objectId: userId,
    } = user;
    const userPosition = positionComposer.getPosition({ positionId: user.objectId });

    const inputs = [
      elementCreator.createInput({
        inputName: 'description',
        elementId: ids.DESCRIPTION,
        multiLine: true,
        shouldResize: true,
        text: description,
        placeholder: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'description' }),
        maxLength: 300,
      }),
    ];

    if (storageManager.getAllowedImages().PROFILE) {
      inputs.push(elementCreator.createImageInput({
        buttonText: labelHandler.getLabel({ baseObject: 'RegisterDialog', label: 'image' }),
        elementId: ids.PICTURE,
        inputName: 'picture',
        appendPreview: true,
        previewId: 'imagePreview-userSelf',
      }));
    }

    const lowerButtons = [
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
        clickFuncs: {
          leftFunc: () => {
            this.removeFromView();
          },
        },
      }),
      // elementCreator.createButton({
      //   text: labelHandler.getLabel({ baseObject: 'UserSelfDialog', label: 'rename' }),
      //   clickFuncs: {
      //     leftFunc: () => {
      //       const renameDialog = new BaseDialog({
      //         inputs: [
      //           elementCreator.createInput({
      //             elementId: 'username',
      //             inputName: 'username',
      //             type: 'text',
      //             isRequired: true,
      //             maxLength: 10,
      //             placeholder: labelHandler.getLabel({ baseObject: 'LoginDialog', label: 'username' }),
      //           }),
      //         ],
      //         lowerButtons: [
      //           elementCreator.createButton({
      //             text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
      //             clickFuncs: {
      //               leftFunc: () => { renameDialog.removeFromView(); },
      //             },
      //           }),
      //           elementCreator.createButton({
      //             text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
      //             clickFuncs: {
      //               leftFunc: () => {
      //                 if (this.hasEmptyRequiredInputs()) {
      //                   return;
      //                 }
      //
      //                 userComposer.updateUsername({
      //                   userId,
      //                   username: renameDialog.getInputValue('username'),
      //                   callback: ({ error: updateError }) => {
      //                     if (updateError) {
      //                       console.log('Failed to update username');
      //
      //                       return;
      //                     }
      //
      //                     const parentElement = renameDialog.getParentElement();
      //
      //                     renameDialog.removeFromView();
      //                     this.addToView({ element: parentElement });
      //                   },
      //                 });
      //               },
      //             },
      //           }),
      //         ],
      //       });
      //
      //       renameDialog.addToView({ element: this.getParentElement() });
      //       this.removeFromView();
      //     },
      //   },
      // }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            const params = {
              userId,
              user: {},
              callback: ({ error }) => {
                if (error) {
                  console.log(error);

                  return;
                }

                this.removeFromView();
              },
            };
            const imagePreview = document.getElementById('imagePreview-userSelf');
            const descriptionInput = this.getInputValue(ids.DESCRIPTION);

            if (imagePreview.getAttribute('src')) {
              params.image = {
                source: imagePreview.getAttribute('src'),
                imageName: imagePreview.getAttribute('name'),
                width: imagePreview.naturalWidth,
                height: imagePreview.naturalHeight,
              };
            }

            if ((description.length === 0 && descriptionInput) || descriptionInput !== description.join('\n')) {
              params.user.description = descriptionInput.split('\n');
            }

            userComposer.updateUser(params);
          },
        },
      }),
    ];

    if (userPosition) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'trackPosition' }),
        clickFuncs: {
          leftFunc: () => {
            viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP });

            eventCentral.emitEvent({
              event: eventCentral.Events.FOCUS_MAPPOSITION,
              params: { position: userPosition },
            });

            this.removeFromView();
          },
        },
      }));
    }

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`,
    ];
    const lowerText = [];

    if (fullName) {
      lowerText.push(fullName);
    }

    lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${username}`);

    if (partOfTeams && partOfTeams.length > 0) {
      const teamNames = partOfTeams.map(teamId => teamComposer.getTeamName({ teamId })).join(', ');

      lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'partOfTeam' })}: ${teamNames}`);
    }

    if (userPosition && userPosition.coordinatesHistory && userPosition.coordinatesHistory[0]) {
      const positionLabel = `(${userPosition.lastUpdated}): Lat ${userPosition.coordinatesHistory[0].latitude} Long ${userPosition.coordinatesHistory[0].longitude}`;

      lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'position' })}: ${positionLabel}`);
    }

    const images = [];

    if (image) {
      images.push(elementCreator.createPicture({
        picture: image,
      }));
    }
    super({
      elementId,
      lowerButtons,
      upperText,
      lowerText,
      images,
      inputs,
      classes: classes.concat(['userSelfDialog']),
    });
  }
}

module.exports = UserSelfDialog;
