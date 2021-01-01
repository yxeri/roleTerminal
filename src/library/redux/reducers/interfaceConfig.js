import { INTERFACECONFIG } from '../actionTypes';

const initialState = {
  hideMenu: false,
};

export default function interfaceConfigReducer(state = initialState, action) {
  if (action.type === INTERFACECONFIG) {
    const { payload } = action;
    const { hideMenu, toggleHideMenu } = payload;
    const newState = { ...state };

    if (Object.keys(payload).every((key) => payload[key] === state[key])) {
      return state;
    }

    if (toggleHideMenu) {
      newState.hideMenu = !state.hideMenu;
    } else if (typeof hideMenu === 'boolean') {
      newState.hideMenu = hideMenu;
    }

    return newState;
  }

  return state;
}
