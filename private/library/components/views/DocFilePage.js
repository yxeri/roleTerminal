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

const BaseView = require('./BaseView');
const LockedDocFileDialog = require('./dialogs/LockedDocFileDialog');
const EditDocFileDialog = require('./dialogs/EditDocFileDialog');

const eventCentral = require('../../EventCentral');
const elementCreator = require('../../ElementCreator');
const userComposer = require('../../data/composers/UserComposer');
const accessCentral = require('../../AccessCentral');
const labelHandler = require('../../labels/LabelHandler');

/**
 * Create fragment with admin buttons for the document.
 * @param {Object} params Parameters.
 * @param {HTMLElement} params.parentElement Parent element to add the fragment to.
 * @param {Object} params.docFile Doc file.
 * @return {DocumentFragment} Fragment with admin buttons.
 */
function createControls({
  parentElement,
  docFile,
}) {
  const fragment = document.createDocumentFragment();

  fragment.appendChild(elementCreator.createButton({
    text: labelHandler.getLabel({ baseObject: 'Button', label: 'edit' }),
    clickFuncs: {
      leftFunc: () => {
        const dialog = new EditDocFileDialog({
          docFileId: docFile.objectId,
        });

        dialog.addToView({
          element: parentElement,
        });
      },
    },
  }));

  return fragment;
}

/**
 * Create header part of the document.
 * @param {Object} params - Parameters.
 * @param {Object} params.docFile - Document to create header for.
 * @return {HTMLElement} Header paragraph.
 */
function createHeader({ docFile }) {
  const idName = userComposer.getIdentityName({ objectId: docFile.ownerAliasId || docFile.ownerId });
  const elements = [
    elementCreator.createSpan({ text: docFile.title }),
    elementCreator.createSpan({ text: `Author: ${idName || 'Unknown author'}` }),
    elementCreator.createSpan({ text: `Code: ${docFile.code}` }),
    elementCreator.createSpan({
      text: `Public: ${docFile.isPublic ?
        labelHandler.getLabel({ baseObject: 'Button', label: 'yes' }) :
        labelHandler.getLabel({ baseObject: 'Button', label: 'no' })}`,
    }),
  ];

  if (docFile.team) {
    elements.push(elementCreator.createSpan({ text: `Team: ${docFile.team}` }));
  }

  return elementCreator.createParagraph({ elements, classes: ['docFileHeader'] });
}

/**
 * Create body part of the document.
 * @param {Object} params - Parameters.
 * @param {Object} params.docFile - Document to create body for.
 * @return {DocumentFragment} Body fragment.
 */
function createBody({ docFile }) {
  const fragment = document.createDocumentFragment();

  docFile.text.forEach((section) => {
    fragment.appendChild(elementCreator.createParagraph({ text: section }));
  });

  return fragment;
}

class DocFilePage extends BaseView {
  constructor({
    classes = [],
    elementId = `dFPage-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['docFilePage']),
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.OPEN_DOCFILE,
      func: ({ docFile }) => {
        const newElement = elementCreator.createContainer({
          elementId,
          classes,
        });
        const { hasFullAccess } = accessCentral.hasAccessTo({
          objectToAccess: docFile,
          toAuth: userComposer.getCurrentUser(),
        });

        if (hasFullAccess) {
          newElement.appendChild(createControls({
            docFile,
            parentElement: this.getParentElement(),
          }));
        }

        newElement.appendChild(createHeader({ docFile }));
        newElement.appendChild(createBody({ docFile }));

        this.replaceOnParent({ element: newElement });
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.ACCESS_DOCFILE,
      func: ({ docFile }) => {
        const { title, objectId } = docFile;
        const dialog = new LockedDocFileDialog({
          title,
          docFileId: objectId,
        });

        dialog.addToView({ element: this.getParentElement() });
      },
    });
  }
}

module.exports = DocFilePage;
