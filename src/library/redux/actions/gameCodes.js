import { GAMECODE, GAMECODES } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const updateGameCodes = ({ gameCodes }) => {
  if (gameCodes.length === 1) {
    return {
      type: GAMECODE,
      payload: {
        gameCode: gameCodes[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: GAMECODES,
    payload: {
      gameCodes,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createGameCodes = ({ gameCodes }) => {
  if (gameCodes.length === 1) {
    return {
      type: GAMECODE,
      payload: {
        gameCode: gameCodes[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: GAMECODES,
    payload: {
      gameCodes,
      changeType: ChangeTypes.CREATE,
    },
  };
};
