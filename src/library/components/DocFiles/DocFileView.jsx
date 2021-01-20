import React, { useCallback, useEffect, useState } from 'react';
import { number, string } from 'prop-types';
import { useSelector } from 'react-redux';

import Window from '../common/Window/Window';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

import './DocFileDir.scss';
import FileMenu from '../common/lists/FileMenu/FileMenu';
import ListItem from '../common/lists/List/Item/ListItem';
import DocFileViewer from './Viewer/DocFileViewer';
import { getDocFileById } from '../../redux/selectors/docFiles';

const DocFileView = ({
  id,
  docFileId,
  index,
}) => {
  const docFile = useSelector((state) => getDocFileById(state, { id: docFileId }));

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DOCFILEVIEW, docFileId } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onCreate = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEDOCFILE, value: { type: WindowTypes.DIALOGCREATEDOCFILE } }] })));

  return (
    <Window
      id={id}
      index={index}
      done={onDone}
      className="DocFileView"
      title={`${docFile ? `File: ${docFile.title}` : 'Files'}`}
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
        </>
      )}
    >
      <DocFileViewer key="viewer" docFileId={docFileId} />
    </Window>
  );
};

export default React.memo(DocFileView);

DocFileView.propTypes = {
  id: string.isRequired,
  docFileId: string,
  index: number.isRequired,
};

DocFileView.defaultProps = {
  docFileId: undefined,
}
