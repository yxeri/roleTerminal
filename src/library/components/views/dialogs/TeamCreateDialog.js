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

import BaseDialog from './BaseDialog';

import elementCreator from '../../../ElementCreator';
import labelHandler from '../../../labels/LabelHandler';
import teamComposer from '../../../data/composers/TeamComposer';
import storageManager from '../../../react/StorageManager';

const ids = {
  TEAMNAME: 'teamName',
  TAG: 'tag',
};

class TeamCreateDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `tCDialog-${Date.now()}`,
  }) {
    const inputs = [
      elementCreator.createInput({
        elementId: ids.TEAMNAME,
        inputName: ids.TEAMNAME,
        type: 'text',
        isRequired: true,
        maxLength: 20,
        placeholder: labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'teamName' }),
      }),
      elementCreator.createInput({
        elementId: ids.TAG,
        inputName: ids.TAG,
        type: 'text',
        isRequired: true,
        maxLength: 5,
        placeholder: labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'tag' }),
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
          leftFunc: () => { this.removeFromView(); },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'create' }),
        clickFuncs: {
          leftFunc: () => {
            if (this.hasEmptyRequiredInputs()) {
              return;
            }

            const params = {
              team: {
                teamName: this.getInputValue(ids.TEAMNAME),
                shortName: this.getInputValue(ids.TAG),
              },
            };
            const imagePreview = document.getElementById('imagePreview-team');

            if (imagePreview && imagePreview.getAttribute('src')) {
              params.image = {
                source: imagePreview.getAttribute('src'),
                imageName: imagePreview.getAttribute('name'),
                width: imagePreview.naturalWidth,
                height: imagePreview.naturalHeight,
              };
            }

            teamComposer.createTeam({
              ...params,
              callback: ({ error }) => {
                if (error) {
                  if (error.type === 'invalid length') {
                    switch (error.extraData.param) {
                      case 'teamName': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'teamNameLength' })] });

                        return;
                      }
                      case 'shortName': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'shortNameLength' })] });

                        return;
                      }
                      case 'maxUserTeam': {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'maxUserTeamLength' })] });

                        return;
                      }
                      default: {
                        this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                        return;
                      }
                    }
                  }

                  this.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'error' })] });

                  return;
                }

                this.removeFromView();
              },
            });
          },
        },
      }),
    ];
    const upperText = [labelHandler.getLabel({ baseObject: 'TeamDialog', label: 'createTeam' })];

    super({
      elementId,
      inputs,
      lowerButtons,
      upperText,
      classes: classes.concat(['teamDialog']),
    });
  }
}

export default TeamCreateDialog;
