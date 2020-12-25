import React from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';
import { getDocFileById } from '../../../redux/selectors/docFiles';
import { getIdentityOrTeamById } from '../../../redux/selectors/users';

import './DocFileViewer.scss';

const DocFileViewer = ({ docFileId }) => {
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));
  const identity = useSelector((state) => getIdentityOrTeamById(state, { id: docFile.ownerAliasId || docFile.ownerId }));

  return (
    <div className="DocFileViewer">
      <h1 className="title">{docFile.title}</h1>
      <div className="info">
        <p className="author">{`Author: ${identity.teamName || identity.aliasName || identity.username}`}</p>
        <p className="code">{`Code: ${docFile.code}`}</p>
        <p className="public">{`Public: ${docFile.isPublic ? 'Yes' : 'No'}`}</p>
      </div>
      <div className="text">{docFile.text.join('\n')}</div>
    </div>
  );
};

export default React.memo(DocFileViewer);

DocFileViewer.propTypes = {
  docFileId: string.isRequired,
};
