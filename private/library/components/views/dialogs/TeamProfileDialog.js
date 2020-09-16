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

import BaseDialog from './BaseDialog';

import elementCreator from '../../../ElementCreator';
import labelHandler from '../../../labels/LabelHandler';
import positionComposer from '../../../data/composers/PositionComposer';
import eventCentral from '../../../EventCentral';
import viewSwitcher from '../../../ViewSwitcher';
import teamComposer from '../../../data/composers/TeamComposer';
import storageManager from '../../../StorageManager';
import userComposer from '../../../data/composers/UserComposer';

const ids = {
  PICTURE: 'picture',
  DESCRIPTION: 'description',
};

class TeamProfileDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `tDialog-${Date.now()}`,
  }) {
    const identity = userComposer.getCurrentIdentity();
    const team = teamComposer.getTeam({
      teamId: identity.partOfTeams
        ? identity.partOfTeams[0]
        : storageManager.getTeamId(),
    });
    const {
      image,
      shortName,
      teamName,
      members,
      locationName,
      description = [],
      objectId: teamId,
    } = team;

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
        previewId: 'imagePreview-team',
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
    ];

    if (locationName) {
      const position = positionComposer.getPositionByName({ positionName: locationName });

      if (position) {
        lowerButtons.push(elementCreator.createButton({
          text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'trackPosition' }),
          clickFuncs: {
            leftFunc: () => {
              viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP });

              eventCentral.emitEvent({
                event: eventCentral.Events.FOCUS_MAPPOSITION,
                params: { position },
              });

              this.removeFromView();
            },
          },
        }));
      }
    }

    lowerButtons.push(elementCreator.createButton({
      text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
      clickFuncs: {
        leftFunc: () => {
          if (this.hasEmptyRequiredInputs()) {
            return;
          }

          const params = {
            teamId,
            team: {},
          };
          const imagePreview = document.getElementById('imagePreview-team');
          const descriptionInput = this.getInputValue(ids.DESCRIPTION);

          if (imagePreview && imagePreview.getAttribute('src')) {
            params.image = {
              source: imagePreview.getAttribute('src'),
              imageName: imagePreview.getAttribute('name'),
              width: imagePreview.naturalWidth,
              height: imagePreview.naturalHeight,
            };
          }

          if ((description.length === 0 && descriptionInput) || descriptionInput !== description.join('\n')) {
            params.team.description = descriptionInput.split('\n');
          }

          teamComposer.updateTeam({
            ...params,
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
    }));

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`,
    ];
    const lowerText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${teamName} [${shortName}]`,
      `Members: ${members.map((memberId) => {
        return userComposer.getIdentityName({ objectId: memberId });
      }).sort().join(', ')}`,
    ];

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
      classes: classes.concat(['teamProfileDialog']),
    });
  }
}

export default TeamProfileDialog;
