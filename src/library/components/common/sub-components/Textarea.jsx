import React, { useState } from 'react';
import {
  bool,
  func,
  string,
} from 'prop-types';

const Textarea = ({
  onChange,
  required = false,
  placeholder = '',
}) => {
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const checkEmpty = (event) => {
    const value = event.target.value.trim();

    if (hasFocus && required) {
      setIsEmpty(value !== '');
    }
  };

  return (
    <input
      defaultValue=""
      className={isEmpty ? 'empty' : ''}
      onFocus={() => setHasFocus(true)}
      onBlur={checkEmpty}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
};

export default Textarea;

Textarea.propTypes = {
  placeholder: string,
  onChange: func.isRequired,
  required: bool,
};

Textarea.defaultProps = {
  placeholder: '',
  required: false,
};
