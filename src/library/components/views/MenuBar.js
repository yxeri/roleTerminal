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

import BaseView from './BaseView';
import LoginDialog from '../../components/views/dialogs/LoginDialog';
import RegisterDialog from '../../components/views/dialogs/RegisterDialog';
import CurrentUserList from '../../components/lists/CurrentUserList';
import AliasDialog from '../../components/views/dialogs/AliasDialog';
import RoomDialog from '../../components/views/dialogs/RoomDialog';
import DocFileDialog from '../../components/views/dialogs/DocFileDialog';
import OpenDocFileDialog from '../../components/views/dialogs/OpenDocFileDialog';
import TeamCreateDialog from '../../components/views/dialogs/TeamCreateDialog';
import UserSelfDialog from '../../components/views/dialogs/UserSelfDialog';
import WalletInfo from '../../components/views/WalletInfo';
import TeamProfileDialog from '../../components/views/dialogs/TeamProfileDialog';

import elementCreator from '../../ElementCreator';
import textTools from '../../react/TextTools';
import labelHandler from '../../labels/LabelHandler';
import accessCentral from '../../AccessCentral';
import socketManager from '../../react/SocketManager';
import eventCentral from '../../EventCentral';
import storageManager from '../../react/StorageManager';
import userComposer from '../../data/composers/UserComposer';
import voiceCommander from '../../VoiceCommander';

class MenuBar extends BaseView {
  constructor({
    title,
    viewSwitcher,
    image,
    currencySign,
    elements,
    corners = [],
    setMenuImage = true,
    appendTop = false,
    showControls = {},
    showClock = true,
    menuItems = [],
    classes = [],
    elementId = `menuBar-${Date.now()}`,
  }) {
    super({
      elementId,
      corners,
      classes: classes.concat(['menuBar']),
    });

    const permissions = storageManager.getPermissions();
    const controls = showControls;

    const items = [];
    const lastItems = [];

    this.viewSwitcher = viewSwitcher;
    this.showClock = showClock;
    this.lists = [];
    this.appendTop = appendTop;
    this.image = image;

    viewSwitcher.parentElement.addEventListener('click', () => {
      this.menuList.classList.add('hide');

      if (this.viewList) {
        this.viewList.classList.add('hide');
      }

      if (this.currentUserList) {
        this.currentUserList.hideView();
      }
    });

    this.element.addEventListener('click', () => {
      if (!socketManager.isOnline) {
        socketManager.reconnect();
      }
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.OFFLINE,
      func: () => {
        this.element.classList.add('offline');
      },
    });

    eventCentral.addWatcher({
      event: eventCentral.Events.ONLINE,
      func: () => {
        this.element.classList.remove('offline');
      },
    });

    if (controls.user) {
      const logoutButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'logout' }),
        clickFuncs: {
          leftFunc: () => {
            socketManager.logout({
              callback: ({ error }) => {
                if (error) {
                  console.log('Failed to logout');

                  return;
                }

                console.log('Logged out');
              },
            });
          },
        },
      });
      const loginButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'login' }),
        clickFuncs: {
          leftFunc: () => {
            const login = new LoginDialog({});

            login.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });
      const registerButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'register' }),
        clickFuncs: {
          leftFunc: () => {
            const register = new RegisterDialog({});

            register.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });
      const profileButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'myProfile' }),
        clickFuncs: {
          leftFunc: () => {
            const profileDialog = new UserSelfDialog({});

            profileDialog.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });
      const teamProfileButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'teamProfile' }),
        clickFuncs: {
          leftFunc: () => {
            const teamProfileDialog = new TeamProfileDialog({});

            teamProfileDialog.addToView({
              element: this.getParentElement(),
            });
          },
        },
      });
      const rebootButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'reboot' }),
        clickFuncs: {
          leftFunc: () => {
            window.location.reload(true);
          },
        },
      });

      accessCentral.addAccessElement({
        maxAccessLevel: accessCentral.AccessLevels.ANONYMOUS,
        element: loginButton,
      });
      accessCentral.addAccessElement({
        minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
        element: logoutButton,
      });
      accessCentral.addAccessElement({
        minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
        element: profileButton,
      });

      items.push({
        elements: [loginButton],
      });

      if (controls.register) {
        accessCentral.addAccessElement({
          maxAccessLevel: permissions.CreateUser
            ? permissions.CreateUser.accessLevel
            : accessCentral.AccessLevels.ANONYMOUS,
          element: registerButton,
        });

        items.push({
          elements: [registerButton],
        });
      }

      if (controls.teamProfile) {
        accessCentral.addAccessElement({
          minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
          element: teamProfileButton,
        });

        eventCentral.addWatcher({
          event: eventCentral.Events.COMPLETE_USER,
          func: () => {
            const identity = userComposer.getCurrentIdentity();

            if (identity.partOfTeams && identity.partOfTeams.length > 0) {
              teamProfileButton.classList.remove('hide');
            }
          },
        });

        eventCentral.addWatcher({
          event: eventCentral.Events.CHANGED_ALIAS,
          func: ({ userId }) => {
            const identity = userComposer.getIdentity({ objectId: userId });

            if (identity.partOfTeams && identity.partOfTeams.length > 0) {
              teamProfileButton.classList.remove('hide');
            } else {
              teamProfileButton.classList.add('hide');
            }
          },
        });

        items.push({
          elements: [teamProfileButton],
        });
      }

      lastItems.push({
        elements: [
          profileButton,
          logoutButton,
          rebootButton,
        ],
      });

      voiceCommander.addCommands({
        activationString: 'menu',
        commands: [
          {
            strings: ['logout'],
            func: () => {
              socketManager.logout({
                callback: ({ error }) => {
                  if (error) {
                    console.log('Failed to logout');

                    return;
                  }

                  console.log('Logged out');
                },
              });
            },
          }, {
            strings: ['login'],
            func: () => {
              const login = new LoginDialog({});

              login.addToView({
                element: this.getParentElement(),
              });
            },
          }, {
            strings: ['register'],
            func: () => {
              const register = new RegisterDialog({});

              register.addToView({
                element: this.getParentElement(),
              });
            },
          },
        ],
      });
    }

    if (showControls.docFile) {
      const openDocButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'openDocument' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new OpenDocFileDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        },
      });

      const createDocFileButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'createDocument' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new DocFileDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        },
      });

      items.push({ elements: [openDocButton, createDocFileButton] });

      accessCentral.addAccessElement({
        element: createDocFileButton,
        minimumAccessLevel: permissions.CreateDocFile
          ? permissions.CreateDocFile.accessLevel
          : accessCentral.AccessLevels.STANDARD,
      });

      voiceCommander.addCommands({
        activationString: 'create',
        commands: [{
          strings: [
            'file',
            'document',
          ],
          func: () => {
            const dialog = new DocFileDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        }],
      });
    }

    if (showControls.room) {
      const createRoomButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'createRoom' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new RoomDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        },
      });

      items.push({ elements: [createRoomButton] });

      accessCentral.addAccessElement({
        element: createRoomButton,
        minimumAccessLevel: permissions.CreateRoom
          ? permissions.CreateRoom.accessLevel
          : accessCentral.AccessLevels.STANDARD,
      });

      voiceCommander.addCommands({
        activationString: 'create',
        commands: [{
          strings: [
            'room',
            'chat room',
          ],
          func: () => {
            const dialog = new RoomDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        }],
      });
    }

    if (showControls.alias) {
      const createAliasButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'createAlias' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new AliasDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        },
      });

      items.push({ elements: [createAliasButton] });

      accessCentral.addAccessElement({
        element: createAliasButton,
        minimumAccessLevel: permissions.CreateAlias
          ? permissions.CreateAlias.accessLevel
          : accessCentral.AccessLevels.STANDARD,
      });

      voiceCommander.addCommands({
        activationString: 'create',
        commands: [{
          strings: [
            'alias',
            'alter ego',
          ],
          func: () => {
            const dialog = new AliasDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        }],
      });
    }

    if (showControls.team) {
      const createTeamButton = elementCreator.createButton({
        text: labelHandler.getLabel({ baseObject: 'Button', label: 'createTeam' }),
        clickFuncs: {
          leftFunc: () => {
            const dialog = new TeamCreateDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        },
      });

      items.push({
        elements: [
          createTeamButton,
        ],
      });

      accessCentral.addAccessElement({
        element: createTeamButton,
        minimumAccessLevel: permissions.CreateTeam
          ? permissions.CreateTeam.accessLevel
          : accessCentral.AccessLevels.STANDARD,
      });

      voiceCommander.addCommands({
        activationString: 'create',
        commands: [{
          strings: [
            'team',
            'group',
          ],
          func: () => {
            const dialog = new TeamCreateDialog({});

            dialog.addToView({
              element: this.viewSwitcher.getParentElement(),
            });
          },
        }],
      });

      eventCentral.addWatcher({
        event: eventCentral.Events.COMPLETE_USER,
        func: () => {
          const identity = userComposer.getCurrentIdentity();

          if (identity.partOfTeams && identity.partOfTeams.length > 0) {
            createTeamButton.classList.add('hide');
          }
        },
      });

      eventCentral.addWatcher({
        event: eventCentral.Events.CHANGED_ALIAS,
        func: ({ userId }) => {
          const identity = userComposer.getIdentity({ objectId: userId });

          if (identity.partOfTeams && identity.partOfTeams.length > 0) {
            createTeamButton.classList.add('hide');
          } else {
            createTeamButton.classList.remove('hide');
          }
        },
      });
    }

    if (items.concat(menuItems, lastItems).length > 0) {
      this.menuList = elementCreator.createList({
        classes: ['hide', 'topMenu'],
        items: items.concat(menuItems, lastItems),
        clickFuncs: {
          leftFunc: () => {
            this.menuList.classList.add('hide');
          },
        },
      });

      const menuButtonParams = {
        classes: ['menuButton'],
        list: this.menuList,
        leftFunc: (event) => {
          this.menuList.classList.toggle('hide');

          event.stopPropagation();
        },
      };

      if (setMenuImage) {
        menuButtonParams.image = {
          fileName: 'menuicon.png',
          height: 20,
          width: 20,
        };
      } else {
        menuButtonParams.text = labelHandler.getLabel({ baseObject: 'MenuBar', label: 'menu' });
      }

      const menuButton = this.createMenuButton(menuButtonParams);

      this.lists.push(this.menuList);
      this.element.appendChild(elementCreator.createContainer({
        elements: [menuButton, this.menuList],
      }));
    }

    if (showControls.currentUser) {
      this.currentUserList = new CurrentUserList({
        classes: ['hide', 'topMenu'],
      });
      const menuButton = this.createMenuButton({
        list: this.currentUserList,
        leftFunc: (event) => {
          this.currentUserList.toggleView();

          event.stopPropagation();
        },
      });
      const container = elementCreator.createContainer({
        elements: [menuButton],
      });
      const watcherFunc = () => {
        MenuBar.setUsername({ button: menuButton });
      };

      this.lists.push(this.currentUserList);
      this.currentUserList.addToView({ element: container });
      this.element.appendChild(container);

      eventCentral.addWatcher({
        event: eventCentral.Events.COMPLETE_USER,
        func: watcherFunc,
      });

      eventCentral.addWatcher({
        event: eventCentral.Events.USER_CHANGE,
        func: watcherFunc,
      });

      eventCentral.addWatcher({
        event: eventCentral.Events.CHANGED_ALIAS,
        func: watcherFunc,
      });

      eventCentral.addWatcher({
        event: eventCentral.Events.CHANGED_NAME,
        func: watcherFunc,
      });
    }

    if (showControls.wallet) {
      const walletInfo = new WalletInfo({
        sign: currencySign,
        appendSign: true,
      });

      walletInfo.addToView({ element: this.element });
    }

    if (elements) {
      elements.forEach((element) => {
        this.element.appendChild(elementCreator.createContainer({ elements: [element] }));
      });
    }

    if (image) {
      this.element.appendChild(elementCreator.createPicture({
        picture: image,
        isUploaded: false,
      }));
    }

    if (this.showClock) {
      this.timeSpan = elementCreator.createSpan({
        text: labelHandler.getLabel({ baseObject: 'MenuBar', label: 'emptyTime' }),
      });

      this.element.appendChild(this.timeSpan);

      this.updateClock();
    }

    if (title) {
      this.element.appendChild(elementCreator.createSpan({ text: title }));
    }
  }

  hideLists({ currentList }) {
    if (this.menuList && this.menuList !== currentList) { this.menuList.classList.add('hide'); }
    if (this.viewList && this.viewList !== currentList) { this.viewList.classList.add('hide'); }
    if (this.currentUserList && this.currentUserList !== currentList) { this.currentUserList.hideView(); }
  }

  createMenuButton({
    list,
    image,
    leftFunc = () => {},
    text = '-----',
    classes = [],
  }) {
    return elementCreator.createSpan({
      text,
      image,
      classes: ['topMenuButton'].concat(classes),
      clickFuncs: {
        leftFunc: (event) => {
          leftFunc(event);

          this.hideLists({ currentList: list });
        },
      },
    });
  }

  static setUsername({ button }) {
    const buttonToChange = button;
    const id = storageManager.getAliasId() || storageManager.getUserId();

    if (id) {
      buttonToChange.textContent = userComposer.getIdentityName({ objectId: id });
    } else {
      buttonToChange.textContent = '-----';
    }
  }

  updateClock() {
    if (!this.showClock) {
      return;
    }

    setTimeout(() => {
      const time = textTools.generateTimestamp({ date: Date.now() });

      if (!this.currentTime || time.mins !== this.currentTime.mins) {
        this.currentTime = textTools.generateTimestamp({ date: Date.now() });
        this.timeSpan.textContent = this.currentTime.halfTime;
      }

      this.updateClock();
    }, 100);
  }

  setViews({ views }) {
    views.forEach((viewObject) => {
      const viewObjectToAdd = viewObject;

      viewObjectToAdd.clickFuncs = {
        leftFunc: () => {
          this.viewSwitcher.switchView({ view: viewObjectToAdd.view });
        },
      };
    });

    this.viewList = elementCreator.createList({
      items: views.map((viewObject) => {
        const { clickFuncs, view } = viewObject;

        return {
          elements: [elementCreator.createButton({
            clickFuncs,
            text: view.getTitle(),
          })],
        };
      }),
      classes: ['hide', 'topMenu'],
      clickFuncs: {
        leftFunc: () => {
          this.viewList.classList.add('hide');
        },
      },
    });

    const menuButton = this.createMenuButton({
      list: this.viewList,
      leftFunc: (event) => {
        this.viewList.classList.toggle('hide');

        event.stopPropagation();
      },
      text: labelHandler.getLabel({ baseObject: 'MenuBar', label: 'changeView' }),
    });
    const container = elementCreator.createContainer({ elements: [menuButton, this.viewList] });

    if (this.lists.length === 0) {
      this.element.insertBefore(container, this.element.firstElementChild);
    } else {
      this.element.insertBefore(container, this.element.childNodes[this.lists.length - 1].nextSibling);
    }

    this.lists.push(this.viewList);
  }
}

export default MenuBar;
