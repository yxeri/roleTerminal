import React from 'react';
import { string } from 'prop-types';
import { useSelector } from 'react-redux';

import ListItem from '../../../../common/lists/List/Item/ListItem';
import { getDocFileById } from '../../../../../redux/selectors/docFiles';
import { ReactComponent as Lock } from '../../../../../icons/lock.svg';
import { ReactComponent as File } from '../../../../../icons/file.svg';
import store from '../../../../../redux/store';
import { changeWindowOrder } from '../../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../../redux/reducers/windowOrder';
import { getCurrentAccessLevel, getIdentityImage, getIdentityName } from '../../../../../redux/selectors/users';
import { AccessLevels } from '../../../../../AccessCentral';
import { unlockDocFile } from '../../../../../socket/actions/docFiles';
import Image from '../../../../common/sub-components/Image/Image';

import './DocFileItem.scss';

const DocFileItem = ({ docFileId }) => {
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));
  const accessLevel = useSelector(getCurrentAccessLevel);
  const creatorImage = useSelector((state) => getIdentityImage(state, { id: docFile.ownerAliasId || docFile.ownerId }));
  const creatorName = useSelector((state) => getIdentityName(state, { id: docFile.ownerAliasId || docFile.ownerId }));
  let icon;

  if (docFile.isLocked) {
    icon = <Lock />;
  } else if (docFile.images && docFile.images[0]) {
    icon = <Image image={`/upload/images/${docFile.images[0].thumbFileName}`} />;
  } else {
    icon = <File />;
  }

  return (
    <ListItem
      stopPropagation
      elementId={`docFile-${docFileId}`}
      className="DocFileItem"
      key={docFile.objectId}
      onClick={() => {
        if (docFile.isLocked && accessLevel < AccessLevels.ADMIN) {
          store.dispatch(changeWindowOrder({
            windows: [{
              id: `${WindowTypes.DIALOGUNLOCKFILE}-${docFileId}`,
              value: {
                docFileId,
                type: WindowTypes.DIALOGUNLOCKFILE,
              },
            }],
          }));

          return;
        }

        unlockDocFile({ docFileId })
          .then(() => store.dispatch(changeWindowOrder({
            windows: [{
              id: `${WindowTypes.DOCFILEVIEW}-${docFileId}`,
              value: {
                docFileId,
                type: WindowTypes.DOCFILEVIEW,
              },
            }],
          })))
          .catch((error) => console.log(error));
      }}
    >
      <div className="icon">{icon}</div>
      <span className="title">{docFile.title}</span>
      <span className="by">
        {
          creatorImage
            ? <Image image={`/upload/images/${creatorImage.thumbFileName}`} />
            : `${creatorName.slice(0, 4)}`
        }
      </span>
    </ListItem>
  );
};

export default React.memo(DocFileItem);

DocFileItem.propTypes = {
  docFileId: string.isRequired,
};
