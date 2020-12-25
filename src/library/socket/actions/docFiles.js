import {
  SendEvents,
  emitSocketEvent,
} from '../SocketManager';
import store from '../../redux/store';
import { createDocFiles } from '../../redux/actions/docFiles';
import { getAliasId } from '../../redux/selectors/aliasId';

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
