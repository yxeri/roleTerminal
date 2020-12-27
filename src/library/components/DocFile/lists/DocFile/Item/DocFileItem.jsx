import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getDocFileById } from '../../../../../redux/selectors/docFiles';
import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';

import { ReactComponent as Lock } from '../../../../../icons/lock.svg';

import './DocFileItem.scss';

const DocFileItem = ({ docFileId }) => {
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));

  return (
    <ListItem
      stopPropagation
      classNames={['DocFileItem']}
      key={docFile.objectId}
      onClick={() => {
        if (docFile.isLocked) {
          console.log('clocked');

          return;
        }

        store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DOCFILE, value: { type: WindowTypes.DOCFILE, docFileId } }] }));
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
};
