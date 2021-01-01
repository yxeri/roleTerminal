import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { func, string } from 'prop-types';
import { FormProvider, useForm, useWatch } from 'react-hook-form';

import List from '../../../common/lists/List/List';
import { getDocFileIdsNames } from '../../../../redux/selectors/docFiles';
import DocFileItem from './Item/DocFileItem';
import Input from '../../../common/sub-components/Input/Input';
import Button from '../../../common/sub-components/Button/Button';
import { ReactComponent as Close } from '../../../../icons/close.svg';
import ListItem from '../../../common/lists/List/Item/ListItem';

const DocFileList = ({ onChange, docFileId }) => {
  const formMethods = useForm();
  const partial = useWatch({ control: formMethods.control, name: 'partial' });
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
      onChange(items[0].click());

      formMethods.reset();
    }
  };

  const onReset = useCallback(() => formMethods.reset(), []);

  return (
    <List
      dropdown
      checkWidth
      title="Documents"
    >
      <ListItem className="search">
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Input name="partial" placeholder="Find document" />
            <Button stopPropagation onClick={onReset}><Close /></Button>
          </form>
        </FormProvider>
      </ListItem>
      {items}
    </List>
  );
};

export default React.memo(DocFileList);

DocFileList.propTypes = {
  docFileId: string,
  onChange: func.isRequired,
};

DocFileList.defaultProps = {
  docFileId: undefined,
};
