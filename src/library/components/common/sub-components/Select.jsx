import React, { useState } from 'react';
import {
  arrayOf,
  bool,
  element,
  func,
  string,
} from 'prop-types';

export default function Select({
  onChange,
  children,
  required = false,
  placeholder = '',
  multiple = false,
}) {
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  function checkEmpty(event) {
    const selectedOptions = Array
      .from(event.target.selectedOptions)
      .filter((option) => option.value !== '');

    if (hasFocus && required) {
      setIsEmpty(selectedOptions.length === 0);
    }
  }

  return (
    <select
      className={isEmpty ? 'empty' : ''}
      onFocus={() => setHasFocus(true)}
      onBlur={checkEmpty}
      onChange={(event) => {
        checkEmpty(event);
        onChange(Array
          .from(event.target.selectedOptions)
          .map((option) => option.value)
          .filter((value) => value !== ''));
      }}
      placeholder={placeholder}
      multiple={multiple}
    >
      {children}
    </select>
  );
}

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
