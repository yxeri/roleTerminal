import createCachedSelector from 're-reselect';

export const getAllDocFiles = (state) => state.docFiles;

export const getDocFileById = (state, { id }) => state.docFiles.get(id);

export const getDocFileIdsNames = createCachedSelector(
  [getAllDocFiles],
  (docFiles) => [...docFiles.values()].map(({ objectId, title }) => ({ objectId, title })),
)(() => 'docFile-ids-names');
