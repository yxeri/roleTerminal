import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm, useWatch } from 'react-hook-form';

import List from '../../../common/lists/List/List';
import { getDocFilesForList } from '../../../../redux/selectors/docFiles';
import DocFileItem from './Item/DocFileItem';
import SearchItem from '../../../common/lists/List/Search/SearchItem';
import { getIdentityName } from '../../../../redux/selectors/users';
import store from '../../../../redux/store';
import ListItem from '../../../common/lists/List/Item/ListItem';
import { ReactComponent as ChevronDown } from '../../../../icons/chevron-down.svg';

import './DocFileList.scss';

const SortBy = {
  TITLE: 'title',
  CREATOR: 'creator',
  TYPE: 'type',
};

const DocFileList = () => {
  const listRef = useRef();
  const formMethods = useForm();
  const partial = useWatch({ control: formMethods.control, name: 'search' });
  const docFiles = useSelector(getDocFilesForList);
  const [sortBy, setSortBy] = useState(SortBy.TITLE);

  const items = (() => {
    let files = docFiles
      .sort((a, b) => {
        let valueA;
        let valueB;

        if (sortBy === SortBy.TITLE) {
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
        } else if (sortBy === SortBy.CREATOR) {
          valueA = getIdentityName(store.getState(), { id: a.ownerAliasId || a.ownerId });
          valueB = getIdentityName(store.getState(), { id: b.ownerAliasId || b.ownerId });
        } else if (sortBy === SortBy.TYPE) {
          valueA = a.isLocked ? 1 : 0;
          valueB = b.isLocked ? 1 : 0;
        }

        if (valueA > valueB) {
          return 1;
        }

        if (valueA < valueB) {
          return -1;
        }

        return 0;
      });

    if (partial && partial.length > 0) {
      files = files.filter((file) => {
        const creatorName = getIdentityName(store.getState(), { id: file.ownerAliasId || file.ownerId });
        const partialSearch = partial.toLowerCase();

        return file.title.toLowerCase().includes(partialSearch)
          || (file.tags || []).includes(partialSearch)
          || creatorName.toLowerCase().includes(partialSearch);
      });
    }

    return files.map(({ objectId }) => <DocFileItem key={objectId} docFileId={objectId} />);
  })();

  const onSubmit = () => {
    if (items.length === 0) {
      formMethods.reset();
    } else if (items.length === 1) {
      const docFileItem = listRef.current.querySelector(`#docFile-${items[0].key}`);

      if (docFileItem) {
        docFileItem.click();

        formMethods.reset();
      }
    }
  };

  return (
    <List
      alwaysExpanded
      className="DocFileList"
      ref={listRef}
    >
      <SearchItem onSubmit={onSubmit} formMethods={formMethods} placeholder="Search by tile/tags/author" />
      <ListItem className="DocFileItem header">
        <div className="icon clickable" onClick={() => setSortBy(SortBy.TYPE)}>
          #
          {sortBy === SortBy.TYPE && (<ChevronDown />)}
        </div>
        <span className="title clickable" onClick={() => setSortBy(SortBy.TITLE)}>
          Title
          {sortBy === SortBy.TITLE && (<ChevronDown />)}
        </span>
        <span className="by icon clickable" onClick={() => setSortBy(SortBy.CREATOR)}>
          By
          {sortBy === SortBy.CREATOR && (<ChevronDown />)}
        </span>
      </ListItem>
      {items}
    </List>
  );
};

export default React.memo(DocFileList);
