import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';
import { useForm, useWatch } from 'react-hook-form';

import List from '../../../common/lists/List/List';
import { getDocFileIdsNames } from '../../../../redux/selectors/docFiles';
import DocFileItem from './Item/DocFileItem';
import SearchItem from '../../../common/lists/List/Search/SearchItem';

const DocFileList = ({ onChange }) => {
  const listRef = useRef();
  const formMethods = useForm();
  const partial = useWatch({ control: formMethods.control, name: 'search' });
  const docFiles = useSelector(getDocFileIdsNames);

  const items = (() => {
    let files = docFiles
      .sort((a, b) => {
        const valueA = a.title.toLowerCase();
        const valueB = b.title.toLowerCase();

        if (valueA > valueB) {
          return 1;
        }

        if (valueA < valueB) {
          return -1;
        }

        return 0;
      });

    if (partial && partial.length > 0) {
      files = files.filter((file) => file.title.toLowerCase().includes(partial.toLowerCase()) || (file.tags || []).includes(partial.toLowerCase()));
    }

    return files.map(({ objectId }) => <DocFileItem key={objectId} docFileId={objectId} onChange={onChange} />);
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
      ref={listRef}
    >
      <SearchItem onSubmit={onSubmit} formMethods={formMethods} placeholder="Search by tile/tags" />
      {items}
    </List>
  );
};

export default React.memo(DocFileList);

DocFileList.propTypes = {
  onChange: func.isRequired,
};
