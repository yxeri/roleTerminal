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


import List from './List';
import BaseDialog from '../views/dialogs/BaseDialog';

import elementCreator from '../../ElementCreator';
import dataHandler from '../../data/DataHandler';
import accessCentral from '../../AccessCentral';
import viewSwitcher from '../../ViewSwitcher';
import labelHandler from '../../labels/LabelHandler';
import walletComposer from '../../data/composers/WalletComposer';
import teamComposer from '../../data/composers/TeamComposer';

export default class TeamList extends List {
  constructor({
    effect,
    shouldToggle,
    classes = [],
    elementId = `teamList-${Date.now()}`,
  }) {
    classes.push('teamList');

    const headerFields = [{
      paramName: 'teamName',
    }];

    super({
      elementId,
      classes,
      effect,
      shouldToggle,
      title: 'Teams',
      listItemSpecificClasses: [
        {
          paramName: 'isVerified',
          paramValue: true,
          classes: ['verified'],
        }, {
          paramName: 'isVerified',
          paramValue: false,
          classes: ['unverified'],
        },
      ],
      minimumAccessLevel: accessCentral.AccessLevels.STANDARD,
      dependencies: [
        dataHandler.users,
        dataHandler.teams,
        dataHandler.aliases,
      ],
      collector: dataHandler.teams,
      listItemFields: headerFields,
      sorting: {
        paramName: 'teamName',
      },
      filter: {
        rules: [
          { paramName: 'isPermissionsOnly', paramValue: false },
        ],
      },
      listItemClickFuncs: {
        leftFunc: (objectId) => {
          const { teamName } = teamComposer.getTeam({ teamId: objectId });
          const dialog = new BaseDialog({
            upperText: [`Updating team: ${teamName}.`, labelHandler.getLabel({ baseObject: 'AdminTeamDialog', label: 'updateTeam' })],
            lowerButtons: [
              elementCreator.createButton({
                text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                clickFuncs: {
                  leftFunc: () => {
                    dialog.removeFromView();
                  },
                },
              }),
              elementCreator.createButton({
                text: labelHandler.getLabel({ baseObject: 'Transaction', label: 'wallet' }),
                clickFuncs: {
                  leftFunc: () => {
                    const walletDialog = new BaseDialog({
                      inputs: [elementCreator.createInput({
                        elementId: 'walletAmount',
                        inputName: 'walletAmount',
                        isRequired: true,
                        maxLength: 6,
                        type: 'number',
                        placeholder: labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'amountPlaceholder' }),
                      })],
                      upperText: [`${labelHandler.getLabel({ baseObject: 'AdminUserDialog', label: 'walletAmount' })}`],
                      lowerButtons: [
                        elementCreator.createButton({
                          text: labelHandler.getLabel({ baseObject: 'BaseDialog', label: 'cancel' }),
                          clickFuncs: {
                            leftFunc: () => { walletDialog.removeFromView(); },
                          },
                        }),
                        elementCreator.createButton({
                          text: labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'sendAmount' }),
                          clickFuncs: {
                            leftFunc: () => {
                              if (walletDialog.hasEmptyRequiredInputs()) {
                                return;
                              }

                              walletComposer.changeWalletAmount({
                                walletId: objectId,
                                amount: walletDialog.getInputValue('walletAmount'),
                                callback: ({ error }) => {
                                  if (error) {
                                    dialog.updateLowerText({ text: [labelHandler.getLabel({ baseObject: 'Transaction', label: 'failed' })] });

                                    return;
                                  }

                                  walletDialog.removeFromView();
                                },
                              });
                            },
                          },
                        }),
                      ],
                    });

                    dialog.removeFromView();
                    walletDialog.addToView({ element: this.element });
                  },
                },
              }),
            ],
          });

          dialog.addToView({ element: viewSwitcher.getParentElement() });
        },
      },
    });
  }
}
