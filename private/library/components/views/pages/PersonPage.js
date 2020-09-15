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

import elementCreator from '../../../ElementCreator';

const BaseView = require('../BaseView');

const userComposer = require('../../../data/composers/UserComposer');
const tools = require('../../../Tools');
const labelHandler = require('../../../labels/LabelHandler');

class PersonPage extends BaseView {
  constructor({
    classes = [],
    elementId = `persPage-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['personPage', 'fullscreen']),
    });

    this.users = tools.shuffleArray(userComposer.getUsers());
  }

  addToView({
    element,
    insertBeforeElement,
    shouldPrepend,
  }) {
    super.addToView({
      element,
      insertBeforeElement,
      shouldPrepend,
    });

    this.showNextPerson();
  }

  showNextPerson() {
    const user = this.users.pop();

    if (!user) {
      this.removeFromView();

      return;
    }

    const {
      image,
      username,
      pronouns,
    } = user;
    const altContainer = elementCreator.createContainer({
      classes: ['hide'],
      clickFuncs: {
        leftFunc: () => {
          this.showNextPerson();
        },
      },
    });
    const container = elementCreator.createContainer({
      clickFuncs: {
        leftFunc: () => {
          container.classList.add('hide');
          altContainer.classList.remove('hide');
        },
      },
    });
    const fragment = document.createDocumentFragment();

    if (image) {
      container.appendChild(elementCreator.createPicture({ picture: image }));
    } else {
      this.showNextPerson();

      return;
    }

    altContainer.appendChild(elementCreator.createPicture({ picture: image }));
    altContainer.appendChild(elementCreator.createParagraph({
      text: username,
    }));
    altContainer.appendChild(elementCreator.createParagraph({
      text: pronouns.map((pronoun) => labelHandler.getLabel({ baseObject: 'General', label: pronoun })).join(', '),
    }));

    fragment.appendChild(container);
    fragment.appendChild(altContainer);
    fragment.appendChild(elementCreator.createButton({
      classes: ['close'],
      text: 'X',
      clickFuncs: {
        leftFunc: () => {
          this.removeFromView();
        },
      },
    }));

    this.element.innerHTML = '';

    this.element.appendChild(fragment);
  }
}

module.exports = PersonPage;
