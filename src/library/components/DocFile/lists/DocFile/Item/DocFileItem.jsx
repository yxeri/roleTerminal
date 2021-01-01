import React from 'react';
import { func, string } from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getDocFileById } from '../../../../../redux/selectors/docFiles';
import { ReactComponent as Lock } from '../../../../../icons/lock.svg';
import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import { getCurrentAccessLevel } from '../../../../../redux/selectors/users';
import { AccessLevels } from '../../../../../AccessCentral';
import { unlockDocFile } from '../../../../../socket/actions/docFiles';

import './DocFileItem.scss';

const DocFileItem = ({ docFileId, onChange }) => {
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));
  const accessLevel = useSelector(getCurrentAccessLevel);

  return (
    <ListItem
      stopPropagation
      className="DocFileItem"
      key={docFile.objectId}
      onClick={() => {
        if (docFile.isLocked && accessLevel < AccessLevels.ADMIN) {
          store.dispatch(changeWindowOrder({
            windows: [{
              id: `${WindowTypes.DIALOGUNLOCKROOM}-${docFileId}`,
              value: {
                docFileId,
                type: WindowTypes.DIALOGUNLOCKROOM,
              },
            }],
          }));

          return;
        }

        unlockDocFile({ docFileId })
          .then(() => onChange(docFileId))
          .catch((error) => console.log(error));
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
