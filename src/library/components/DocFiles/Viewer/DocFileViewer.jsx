import React from 'react';
import { batch, useSelector } from 'react-redux';
import { string } from 'prop-types';
import { getDocFileById } from '../../../redux/selectors/docFiles';
import { getIdentityOrTeamById } from '../../../redux/selectors/users';

import './DocFileViewer.scss';
import store from '../../../redux/store';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import Button from '../../common/sub-components/Button/Button';
import Image from '../../common/sub-components/Image/Image';

const DocFileViewer = ({ docFileId }) => {
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));
  const identity = useSelector((state) => getIdentityOrTeamById(state, { id: docFile.ownerAliasId || docFile.ownerId }));

  if (docFile.isLocked) {
    return (
      <div className="DocFileViewer">
        <div>
          This file is locked.
          <Button
            onClick={() => {
              batch(() => {
                store.dispatch(changeWindowOrder({
                  windows: [{
                    id: `${WindowTypes.DIALOGUNLOCKFILE}-${docFileId}`,
                    value: {
                      docFileId,
                      type: WindowTypes.DIALOGUNLOCKFILE,
                    },
                  }],
                }));
                store.dispatch(removeWindow({ id: `${WindowTypes.DOCFILEVIEW}-${docFileId}` }));
              });
            }}
          >
            Unlock?
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="DocFileViewer">
      <h1 className="title">{docFile.title}</h1>
      <div className="info">
        <p className="author">{`Author: ${identity.teamName || identity.aliasName || identity.username}`}</p>
        <p className="code">{`Code: ${docFile.code}`}</p>
        <p className="public">{`Public: ${docFile.isPublic ? 'Yes' : 'No'}`}</p>
        {docFile.tags && docFile.tags.length > 0 && (<p>{docFile.tags.join(', ')}</p>)}
      </div>
      {docFile.images && docFile.images.length > 0 && (
        <div className="images">
          {docFile.images.map((image) => (
            <Image
              scrollTo
              key={image.thumbFileName}
              image={`/upload/images/${image.thumbFileName}`}
              altText="pic"
              width={image.thumbWidth}
              height={image.thumbHeight}
              fullImage={`/upload/images/${image.fileName}`}
              fullWidth={image.width}
              fullHeight={image.height}
            />
          ))}
        </div>
      )}
      <div className="text">{docFile.text.join('\n')}</div>
    </div>
  );
};

export default React.memo(DocFileViewer);

DocFileViewer.propTypes = {
  docFileId: string.isRequired,
};
