import { DOCFILE, DOCFILES } from '../actionTypes';
import { ChangeTypes } from '../reducers/root';

export const updateDocFiles = ({ docFiles }) => {
  if (docFiles.length === 1) {
    return {
      type: DOCFILE,
      payload: {
        docFile: docFiles[0],
        changeType: ChangeTypes.UPDATE,
      },
    };
  }

  return {
    type: DOCFILES,
    payload: {
      docFiles,
      changeType: ChangeTypes.UPDATE,
    },
  };
};

export const createDocFiles = ({ docFiles }) => {
  if (docFiles.length === 1) {
    return {
      type: DOCFILE,
      payload: {
        docFile: docFiles[0],
        changeType: ChangeTypes.CREATE,
      },
    };
  }

  return {
    type: DOCFILES,
    payload: {
      docFiles,
      changeType: ChangeTypes.CREATE,
    },
  };
};
