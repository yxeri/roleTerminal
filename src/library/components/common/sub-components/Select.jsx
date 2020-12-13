import React, { useState } from 'react';
import {
  arrayOf,
  bool,
  element,
  func,
  string,
} from 'prop-types';

const Select = ({
  onChange,
  children,
  required = false,
  placeholder = '',
  multiple = false,
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const checkEmpty = (event) => {
    const selectedOptions = Array
      .from(event.target.selectedOptions)
      .filter((option) => option.value !== '');

    if (hasFocus && required) {
      setIsEmpty(selectedOptions.length === 0);
    }
  };

  const onChangeFunc = (event) => {
    checkEmpty(event);
    onChange(Array
      .from(event.target.selectedOptions)
      .map((option) => option.value)
      .filter((value) => value !== ''));
  };

  return (
    <select
      className={`Select ${isEmpty ? 'empty' : ''}`}
      onFocus={() => setHasFocus(true)}
      onBlur={checkEmpty}
      onChange={onChangeFunc}
      placeholder={placeholder}
      multiple={multiple}
    >
      {children}
    </select>
  );
};

export default Select;

Select.propTypes = {
  multiple: bool,
  children: arrayOf(element),
  placeholder: string,
  onChange: func.isRequired,
  required: bool,
};

Select.defaultProps = {
  multiple: false,
  children: undefined,
  placeholder: '',
  required: false,
};
