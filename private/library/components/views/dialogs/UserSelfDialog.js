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
import PasswordDialog from './PasswordDialog';
import NameDialog from './NameDialog';

import elementCreator from '../../../ElementCreator';
import labelHandler from '../../../labels/LabelHandler';
import userComposer from '../../../data/composers/UserComposer';
import positionComposer from '../../../data/composers/PositionComposer';
import eventCentral from '../../../EventCentral';
import viewSwitcher from '../../../ViewSwitcher';
import teamComposer from '../../../data/composers/TeamComposer';
import storageManager from '../../../StorageManager';
import aliasComposer from '../../../data/composers/AliasComposer';

const ids = {
  PICTURE: 'picture',
  DESCRIPTION: 'description',
};

class UserSelfDialog extends BaseDialog {
  constructor({
    classes = [],
    elementId = `uDialog-${Date.now()}`,
  }) {
    const identity = userComposer.getCurrentIdentity();
    const {
      image,
      partOfTeams,
      fullName,
      username,
      aliasName,
      description,
      code,
      customFields = [],
      objectId: identityId,
    } = identity;
    const identityPosition = positionComposer.getPosition({ positionId: identity.objectId });
    const name = aliasName || username;
    const isAlias = typeof aliasName !== 'undefined';
    const customUserFields = storageManager.getCustomUserFields();

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

    customUserFields.forEach((field) => {
      const {
        type,
        parent,
        hidden,
        revealOnClick,
        maxLength,
        name: fieldName,
      } = field;
      const existing = customFields.find((customField) => customField.name === fieldName);
      const hasRevealer = customUserFields.find((customField) => customField.parent === parent && customField.revealOnClick);
      const revealer = hasRevealer
        ? customFields.find((customField) => customField.name === hasRevealer.name)
        : undefined;

      if (type === 'checkBox') {
        inputs.push(elementCreator.createCheckBox({
          parent,
          isChecked: existing && existing.value,
          name: fieldName,
          classes: hidden && (!revealer || !revealer.value)
            ? ['hide']
            : undefined,
          elementId: fieldName,
          text: labelHandler.getLabel({ baseObject: parent, label: fieldName }),
          clickFuncs: revealOnClick
            ? {
              leftFunc: () => {
                Array.from(this.inputContainer.children).forEach((child) => {
                  const parentName = child.getAttribute('parent');
                  const childName = child.getAttribute('name');

                  if (parentName && parentName === parent && childName && childName !== fieldName) {
                    if (this.getInputValue(fieldName, 'checkBox')) {
                      child.classList.remove('hide');
                    } else {
                      child.classList.add('hide');
                    }
                  }
                });
              },
            }
            : undefined,
        }));
      } else if (type === 'input' || type === 'textArea') {
        const existingValue = existing
          ? existing.value
          : undefined;

        inputs.push(elementCreator.createInput({
          parent,
          maxLength,
          multiLine: type === 'textArea',
          text: existingValue && type !== 'textArea'
            ? [existingValue]
            : existingValue,
          inputName: fieldName,
          classes: hidden && (!revealer || !revealer.value)
            ? ['hide']
            : undefined,
          elementId: fieldName,
          placeholder: labelHandler.getLabel({ baseObject: parent, label: fieldName }),
        }));
      }
    });

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
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'password' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new PasswordDialog({});

            dialog.addToView({ element: this.getParentElement() });
            this.removeFromView();
          },
        },
      }),
      elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'name' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new NameDialog({});

            dialog.addToView({ element: this.getParentElement() });
            this.removeFromView();
          },
        },
      }),
    ];

    if (identityPosition) {
      lowerButtons.push(elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'UserDialog', label: 'trackPosition' }),
        clickFuncs: {
          leftFunc: () => {
            viewSwitcher.switchViewByType({ type: viewSwitcher.ViewTypes.WORLDMAP });

            eventCentral.emitEvent({
              event: eventCentral.Events.FOCUS_MAPPOSITION,
              params: { position: identityPosition },
            });

            this.removeFromView();
          },
        },
      }));
    }

    lowerButtons.push(elementCreator.createButton({
      text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'update' }),
      clickFuncs: {
        leftFunc: () => {
          if (this.hasEmptyRequiredInputs()) {
            return;
          }

          const params = {
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
          const object = {
            customFields: [],
          };

          if (imagePreview && imagePreview.getAttribute('src')) {
            params.image = {
              source: imagePreview.getAttribute('src'),
              imageName: imagePreview.getAttribute('name'),
              width: imagePreview.naturalWidth,
              height: imagePreview.naturalHeight,
            };
          }

          if ((description.length === 0 && descriptionInput) || descriptionInput !== description.join('\n')) {
            object.description = descriptionInput.split('\n');
          }

          if (customUserFields.length > 0) {
            object.customFields = [];

            customUserFields.forEach((field) => {
              const {
                type,
                name: fieldName,
              } = field;

              if (type === 'checkBox') {
                object.customFields.push({
                  name: fieldName,
                  value: this.getInputValue(fieldName, 'checkBox'),
                });
              } else if (type === 'input') {
                object.customFields.push({
                  name: fieldName,
                  value: this.getInputValue(fieldName),
                });
              } else if (type === 'textArea') {
                object.customFields.push({
                  name: fieldName,
                  value: this.getInputValue(fieldName).split('\n'),
                });
              }
            });
          }

          if (isAlias) {
            params.aliasId = identityId;
            params.alias = object;
            aliasComposer.updateAlias(params);
          } else {
            params.userId = identityId;
            params.user = object;
            userComposer.updateUser(params);
          }
        },
      },
    }));

    const upperText = [
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'userInfo' })}`,
    ];
    const lowerText = [];

    if (fullName) {
      lowerText.push(fullName);
    }

    lowerText.push(
      `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'username' })}: ${name}`,
    );

    if (code) {
      lowerText.push(
        `${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'code' })}: ${code}`,
      );
    }

    if (partOfTeams && partOfTeams.length > 0) {
      const teamNames = partOfTeams.map((teamId) => teamComposer.getTeamName({ teamId })).join(', ');

      lowerText.push(`${labelHandler.getLabel({ baseObject: 'UserDialog', label: 'partOfTeam' })}: ${teamNames}`);
    }

    if (identityPosition && identityPosition.coordinatesHistory && identityPosition.coordinatesHistory[0]) {
      const positionLabel = `(${identityPosition.lastUpdated}): Lat ${identityPosition.coordinatesHistory[0].latitude} Long ${identityPosition.coordinatesHistory[0].longitude}`;

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

export default UserSelfDialog;
