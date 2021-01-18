import createCachedSelector from 're-reselect';

export const getAllDocFiles = (state) => state.docFiles;

export const getDocFileById = (state, { id }) => state.docFiles.get(id);

export const getDocFilesForList = createCachedSelector(
  [getAllDocFiles],
  (docFiles) => [...docFiles.values()]
    .map(({
      objectId,
      title,
      ownerAliasId,
      ownerId,
      isLocked,
    }) => ({
      objectId,
      title,
      ownerAliasId,
      ownerId,
      isLocked,
    })),
)(() => 'docFile-ids-names');
