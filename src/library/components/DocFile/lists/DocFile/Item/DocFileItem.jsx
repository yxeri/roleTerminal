import React from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getDocFileById } from '../../../../../redux/selectors/docFiles';

import { ReactComponent as Lock } from '../../../../../icons/lock.svg';

import './DocFileItem.scss';

const DocFileItem = ({ docFileId, onChange }) => {
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));

  return (
    <ListItem
      stopPropagation
      className="DocFileItem"
      key={docFile.objectId}
      onClick={() => {
        if (docFile.isLocked) {
          console.log('locked');

          return;
        }

        onChange(docFileId);
      }}
    >
      {docFile.title}
      {docFile.isLocked && (
        <div className="lock"><Lock /></div>
      )}
    </ListItem>
  );
};

export default React.memo(DocFileItem);

DocFileItem.propTypes = {
  docFileId: string.isRequired,
  onChange: func.isRequired,
};
