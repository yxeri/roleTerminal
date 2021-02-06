import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { string } from 'prop-types';

import ListItem from '../../../common/lists/List/Item/ListItem';
import store from '../../../../redux/store';
import { changeWindowOrder } from '../../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../../redux/reducers/windowOrder';
import FileMenu from '../../../common/lists/FileMenu/FileMenu';
import { getCurrentUser } from '../../../../redux/selectors/users';
import { ReactComponent as Plus } from '../../../../icons/plus.svg';
import { ReactComponent as Files } from '../../../../icons/files.svg';

const DocFileFileMenu = ({ id }) => {
  const currentUser = useSelector(getCurrentUser);

  const onCreate = useCallback(() => store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGCREATEDOCFILE, value: { type: WindowTypes.DIALOGCREATEDOCFILE } }] })));

  return (
    <FileMenu
      menuIcon={<Files />}
      key="fileMenu"
      id={id}
    >
      {!currentUser.isAnonymous && (
        <ListItem
          stopPropagation
          onClick={onCreate}
          key="createDocFile"
        >
          <Plus />
          <span>New document</span>
        </ListItem>
      )}
    </FileMenu>
  );
};

export default DocFileFileMenu;

DocFileFileMenu.propTypes = {
  id: string.isRequired,
};
