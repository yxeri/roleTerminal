import { combineReducers } from 'redux';

import users from './users';
import aliases from './aliases';
import messages from './messages';
import online from './online';
import rooms from './rooms';
import positions from './positions';
import transactions from './transactions';
import userId from './userId';
import wallets from './wallets';
import config from './config';
import token from './token';

export default combineReducers({
  users,
  aliases,
  messages,
  online,
  rooms,
  userId,
  positions,
  transactions,
  wallets,
  config,
  token,
});
