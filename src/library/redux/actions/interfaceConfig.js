import { INTERFACECONFIG } from '../actionTypes';

export const changeInterfaceConfig = ({ hideMenu, toggleHideMenu }) => ({
  type: INTERFACECONFIG,
  payload: {
    hideMenu,
    toggleHideMenu,
  },
});
