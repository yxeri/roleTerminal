import {
  SendEvents,
  emitSocketEvent,
} from '../SocketManager';
import store from '../../redux/store';
import { createDocFiles, updateDocFiles } from '../../redux/actions/docFiles';
import { getAliasId } from '../../redux/selectors/aliasId';
import { getDocFileById } from '../../redux/selectors/docFiles';
import { getCurrentUser } from '../../redux/selectors/users';
import { hasAccessTo } from '../../AccessCentral';

export const createDocFile = async ({ docFile, images }) => {
  const docFileToCreate = {
    ...docFile,
    code: docFile.code !== '' ? docFile.code : undefined,
    ownerAliasId: getAliasId(store.getState()) || undefined,
    text: docFile.text.split('\n'),
  };

  const result = await emitSocketEvent(SendEvents.DOCFILE, { docFile: docFileToCreate, images });

  await store.dispatch(createDocFiles({ docFiles: [result.docFile] }));

  return result;
};

export const unlockDocFile = async ({ docFileId, code }) => {
  const data = {
    docFileId,
    code,
    aliasId: getAliasId(store.getState()) || undefined,
  };
  const currentUser = getCurrentUser(store.getState());
  const storedDocFile = getDocFileById(store.getState(), { id: docFileId });

  if (currentUser.isAnonymous && storedDocFile.isPublic) {
    return { docFile: storedDocFile };
  }

  const { hasAccess, adminAccess } = hasAccessTo({
    toAuth: currentUser,
    objectToAccess: {
      ...storedDocFile,
      isPublic: false,
    },
  });

  if (hasAccess && !adminAccess) {
    return { docFile: storedDocFile };
  }

  const result = await emitSocketEvent(SendEvents.UNLOCKDOCFILE, data);

  await store.dispatch(updateDocFiles({ docFiles: [result.docFile] }));

  return result;
};
