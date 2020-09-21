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

import {
  transactions,
  aliases,
  users,
  teams,
  wallets,
} from '../../data/DataHandler';
import walletComposer from '../../data/composers/WalletComposer';
import labelHandler from '../../labels/LabelHandler';
import textTools from '../../react/TextTools';

export default class TransactionList extends List {
  constructor({
    effect,
    reverseSorting = true,
    toText = '->',
    classes = [],
    elementId = `tList-${Date.now()}`,
  }) {
    const headerFields = [
      {
        paramName: 'fromWalletId',
        convertFunc: (fromWalletId) => {
          return `${walletComposer.getWalletOwnerName({ walletId: fromWalletId }) || fromWalletId} ${toText} `;
        },
      }, {
        paramName: 'toWalletId',
        convertFunc: (toWalletId) => {
          return `${walletComposer.getWalletOwnerName({ walletId: toWalletId }) || toWalletId}`;
        },
      }, {
        paramName: 'amount',
        convertFunc: (amount) => {
          return `${amount}${labelHandler.getLabel({ baseObject: 'WalletDialog', label: 'currency' })}`;
        },
      }, {
        paramName: 'customTimeCreated',
        fallbackTo: 'timeCreated',
        convertFunc: (time) => {
          const timestamp = textTools.generateTimestamp({ date: time });

          return `${timestamp.fullDate} ${timestamp.fullTime}`;
        },
      }, {
        paramName: 'note',
      },
    ];

    super({
      elementId,
      effect,
      shouldFocusOnClick: false,
      sorting: {
        paramName: 'cutomTimeCreated',
        fallbackParamName: 'timeCreated',
        reverse: reverseSorting,
      },
      classes: classes.concat(['transactionList']),
      dependencies: [
        transactions,
        aliases,
        users,
        teams,
        wallets,
      ],
      collector: transactions,
      listItemFields: headerFields,
    });
  }
}