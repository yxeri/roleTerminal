import React, { useCallback } from 'react';
import { number, string } from 'prop-types';

import Window from '../common/Window/Window';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';
import DocFileList from './lists/DocFile/DocFileList';

import './DocFileDir.scss';
import DocFileFileMenu from './lists/FileMenu/DocFileFileMenu';

const DocFileDir = ({ id, index }) => {
  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DOCFILEDIR } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  return (
    <Window
      id={id}
      index={index}
      done={onDone}
      className="DocFileDir"
      title={<span>Directory</span>}
      onClick={onClick}
      menu={<DocFileFileMenu id={id} />}
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
