import React from 'react';
import { useSelector } from 'react-redux';

import List from '../../../common/lists/List/List';
import { getDocFileIdsNames } from '../../../../redux/selectors/docFiles';
import DocFileItem from './Item/DocFileItem';

const DocFileList = () => {
  const docFile = useSelector(getDocFileIdsNames);

  const itemMapper = () => docFile
    .sort((a, b) => {
      const valueA = a.title.toLowerCase();
      const valueB = b.title.toLowerCase();

      if (valueA > valueB) {
        return 1;
      }

      if (valueA < valueB) {
        return -1;
      }

      return 0;
    })
    .map(({ objectId }) => <DocFileItem key={objectId} docFileId={objectId} />);

  return (
    <List
      dropdown
      checkWidth
      title="Documents"
    >
      {itemMapper()}
    </List>
  );
};

export default React.memo(DocFileList);
