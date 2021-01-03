import React from 'react';
import { FormProvider } from 'react-hook-form';
import { func, object, string } from 'prop-types';

import Input from '../../../sub-components/Input/Input';
import Button from '../../../sub-components/Button/Button';
import { ReactComponent as Delete } from '../../../../../icons/delete.svg';
import ListItem from '../Item/ListItem';

import './SearchItem.scss';

const SearchItem = ({ onSubmit, formMethods, placeholder = 'Search' }) => (
  <ListItem className="SearchItem">
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(onSubmit)}>
        <Input name="search" placeholder={placeholder} />
        <Button stopPropagation onClick={() => formMethods.reset()}><Delete /></Button>
      </form>
    </FormProvider>
  </ListItem>
);

export default React.memo(SearchItem);

SearchItem.propTypes = {
  onSubmit: func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formMethods: object.isRequired,
  placeholder: string,
};

SearchItem.defaultProps = {
  placeholder: 'Search',
};
