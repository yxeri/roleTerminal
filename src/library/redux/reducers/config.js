import { CONFIG } from '../actionTypes';
import { AccessLevels } from '../../AccessCentral';

const defaultState = new Map();

defaultState.set('broadcastId', '111111111111111111111116');
defaultState.set('publicRoomId', '111111111111111111111110');
defaultState.set('defaultForum', '111111111111111111111120');
defaultState.set('defaultLanguage', 'en');
defaultState.set('centerCoordinates', { longitude: 0, latitude: 0 });
defaultState.set('cornerOneCoordinates', { longitude: 0, latitude: 0 });
defaultState.set('cornerTwoCoordinates', { longitude: 0, latitude: 0 });
defaultState.set('defaultZoomLevel', 15);
defaultState.set('yearModification', 0);
defaultState.set('dayModification', 0);
defaultState.set('requireOffName', false);
defaultState.set('activateTermination', false);
defaultState.set('allowedImages', { CHAT: false, PROFILE: false, DOCFILE: false });
defaultState.set('permissions', {});
defaultState.set('anonymousUser', {
  accessLevel: AccessLevels.ANONYMOUS,
  followingRooms: [],
  objectId: '-1',
  isAnonymous: true,
});
// customUserFields
// device id

export default function ConfigReducer(state = defaultState, action) {
  if (action.type === CONFIG) {
    const { payload } = action;
    const { entries } = payload;
    const newState = new Map([...state]);

    entries.forEach((keyValue) => newState.set(keyValue[0], keyValue[1]));

    return newState;
  }

  return state;
}
