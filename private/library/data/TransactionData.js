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

import BaseData from './BaseData';

import eventCentral from '../EventCentral';
import { EmitTypes } from '../SocketManager';

class TransactionData extends BaseData {
  constructor() {
    super({
      createEvents: {
        one: 'createTransaction',
      },
      retrieveEvents: {
        one: 'getTransaction',
        many: 'getTransactions',
      },
      updateEvents: {
        one: 'updateTransaction',
      },
      objectTypes: {
        one: 'transaction',
        many: 'transactions',
      },
      eventTypes: {
        one: eventCentral.Events.TRANSACTION,
        many: eventCentral.Events.TRANSACTIONS,
      },
      removeEvents: {
        one: 'removeTransaction',
      },
      emitTypes: [EmitTypes.TRANSACTION],
    });
  }
}

const transactionData = new TransactionData();

export default transactionData;
