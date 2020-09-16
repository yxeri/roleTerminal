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

import elementCreator from '../../ElementCreator';

import BaseView from './BaseView';

class TextAnimation extends BaseView {
  constructor({
    messages = [],
    endFunc = () => {},
    classes = [],
    elementId = `textAnim-${Date.now()}`,
  }) {
    super({
      elementId,
      classes: classes.concat(['textAnimation']),
    });

    this.endFunc = endFunc;
    this.printing = false;
    this.queue = messages;
    this.textList = elementCreator.createList({
      classes: ['textAnimation'],
    });

    this.element.appendChild(this.textList);
  }

  consumeQueue() {
    const object = this.queue.shift();
    this.printing = true;

    if (object) {
      const {
        element,
        beforeTimeout,
        afterTimeout = 50,
      } = object;

      const callback = () => {
        this.textList.appendChild(elementCreator.createListItem({ elements: [element] }));
        this.textList.lastElementChild.scrollIntoView(true);

        setTimeout(() => { this.consumeQueue(); }, afterTimeout);
      };

      if (beforeTimeout) {
        setTimeout(callback, beforeTimeout);

        return;
      }

      callback();
    } else {
      this.printing = false;

      this.endFunc();
      this.removeFromView();
    }
  }

  queueMessages({
    objects,
  }) {
    this.queue.push(...objects);

    if (!this.printing) {
      this.consumeQueue({ queue: this.queue });
    }
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

    this.consumeQueue();
  }
}

export default TextAnimation;
