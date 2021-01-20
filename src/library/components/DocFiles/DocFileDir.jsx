import React, { useCallback } from 'react';
import { number, string } from 'prop-types';

import Window from '../common/Window/Window';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import FileMenu from '../common/lists/FileMenu/FileMenu';
import ListItem from '../common/lists/List/Item/ListItem';
import DocFileList from './lists/DocFile/DocFileList';
import { ReactComponent as Plus } from '../../icons/plus.svg';

import './DocFileDir.scss';

const DocFileDir = ({ id, index }) => {
  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DOCFILEDIR } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onCreate = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEDOCFILE, value: { type: WindowTypes.DIALOGCREATEDOCFILE } }] })));

  return (
    <Window
      id={id}
      index={index}
      done={onDone}
      className="DocFileDir"
      title="Files"
      onClick={onClick}
      menu={(
        <>
          <FileMenu id={id}>
            <ListItem
              stopPropagation
              onClick={onCreate}
              key="createDocFile"
            >
              <Plus />
              <span>New document</span>
            </ListItem>
          </FileMenu>
        </>
      )}
    >
      <DocFileList />
    </Window>
  );
};

export default React.memo(DocFileDir);

DocFileDir.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
