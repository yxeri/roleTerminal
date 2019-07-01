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

const eventCentral = require('./EventCentral');
const storageManager = require('./StorageManager');

let currentView;

class ViewSwitcher {
  constructor() {
    this.ViewTypes = {
      CHAT: 'chat',
      WORLDMAP: 'worldMap',
      DOCS: 'docs',
      WALLET: 'wallet',
      TEAM: 'team',
      FORUM: 'forum',
      PEOPLE: 'people',
      TERMINAL: 'terminal',
    };
    this.parentElement = undefined;
    this.availableTypes = [];
    this.defaultView = undefined;

    eventCentral.addWatcher({
      event: eventCentral.Events.LOGOUT,
      func: () => {
        this.switchView({ view: this.defaultView });
      },
    });
  }

  switchView({
    view,
    setToDefault = false,
  }) {
    const defaultViewType = storageManager.getDefaultViewType();

    if (setToDefault && defaultViewType && this.availableTypes.includes(defaultViewType)) {
      this.switchViewByType({ type: defaultViewType });

      return;
    }

    if (view === currentView) {
      return;
    }

    if (currentView) {
      currentView.removeFromView();
    }

    currentView = view;

    view.addToView({ element: this.parentElement });
    storageManager.setDefaultViewType(view.viewType);

    eventCentral.emitEvent({
      event: eventCentral.Events.VIEW_SWITCHED,
      params: { view },
    });
  }

  switchViewByType({ type }) { // eslint-disable-line class-methods-use-this
    eventCentral.emitEvent({
      event: eventCentral.Events.TRY_VIEW_SWITCH,
      params: { type },
    });
  }

  setParentElement({ element }) {
    this.parentElement = element;

    return this;
  }

  getParentElement() {
    return this.parentElement;
  }

  addAvailableTypes({ types = [] }) {
    this.availableTypes = this.availableTypes.concat(types);
  }

  setDefaultView({ view }) {
    this.defaultView = view;
  }
}

const viewSwitcher = new ViewSwitcher();

module.exports = viewSwitcher;
