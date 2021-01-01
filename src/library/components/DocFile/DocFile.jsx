import React, { useCallback, useEffect, useState } from 'react';
import { number, string } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

import './DocFile.scss';
import FileMenu from '../common/lists/FileMenu';
import ListItem from '../common/lists/List/Item/ListItem';
import DocFileList from './lists/DocFile/DocFileList';
import DocFileViewer from './Viewer/DocFileViewer';
import { getDocFileById } from '../../redux/selectors/docFiles';

const DocFile = ({ id, docFileId, index }) => {
  const [currentDocFileId, setDocFileId] = useState();
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));

  useEffect(() => {
    if (docFileId && currentDocFileId !== docFileId) {
      setDocFileId(docFileId);
    }
  }, [docFileId]);

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DOCFILE } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onChange = useCallback((newDocFileId) => setDocFileId(newDocFileId), []);

  const onCreate = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEDOCFILE, value: { type: WindowTypes.DIALOGCREATEDOCFILE } }] })));

  return (
    <Window
      id={id}
      index={index}
      done={onDone}
      className="DocFile"
      title={`${docFile ? `Document: ${docFile.title}` : 'Documents'}`}
      onClick={onClick}
      menu={(
        <>
          <FileMenu id={id}>
            <ListItem
              stopPropagation
              onClick={onCreate}
              key="createDocFile"
            >
              New document
            </ListItem>
          </FileMenu>
          <DocFileList onChange={onChange} />
        </>
      )}
    >
      {!currentDocFileId && (
        <div />
      )}
      {currentDocFileId && (
        <DocFileViewer key="viewer" docFileId={currentDocFileId} />
      )}
    </Window>
  );
};

export default React.memo(DocFile);

DocFile.propTypes = {
  id: string.isRequired,
  docFileId: string,
  index: number.isRequired,
};

DocFile.defaultProps = {
  docFileId: undefined,
}
