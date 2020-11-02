import React, { useState } from 'react';
import { string, bool, func } from 'prop-types';

export default function Input({
  onChange,
  type = 'text',
  required = false,
  placeholder = '',
}) {
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  function checkEmpty(event) {
    if (hasFocus && required) {
      setIsEmpty(event.target.value !== '');
    }
  }

  return (
    <input
      type={type}
      defaultValue=""
      className={isEmpty ? 'empty' : ''}
      onFocus={() => setHasFocus(true)}
      onBlur={checkEmpty}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
    />
  );
};

Input.propTypes = {
  onChange: func.isRequired,
  required: bool,
  placeholder: string,
  type: string,
};

Input.defaultProps = {
  placeholder: '',
  required: false,
  type: 'text',
};
