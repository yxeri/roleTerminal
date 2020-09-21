import { combineReducers } from 'redux';

import users from './users';
import aliases from './aliases';
import messages from './messages';
import rooms from './rooms';
import userId from './userId';
import roomId from './roomId';
import positions from './positions';

export default combineReducers({
  users,
  aliases,
  messages,
  rooms,
  userId,
  roomId,
  positions,
});
