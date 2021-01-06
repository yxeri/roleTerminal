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
import aliasId from './aliasId';
import windowOrder from './windowOrder';
import teams from './teams';
import docFiles from './docFiles';
import mode from './mode';
import interfaceConfig from './interfaceConfig';
import devices from './devices';

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
  aliasId,
  windowOrder,
  teams,
  docFiles,
  mode,
  interfaceConfig,
  devices,
});
