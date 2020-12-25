import React, { useState } from 'react';
import {
  bool,
  func, number,
  string,
} from 'prop-types';
import { useFormContext } from 'react-hook-form';

const Textarea = ({
  onChange,
  name,
  maxLength,
  required = false,
  placeholder = '',
}) => {
  const { register } = useFormContext();
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const checkEmpty = (event) => {
    const value = event.target.value.trim();

    if (hasFocus && required) {
      setIsEmpty(value !== '');
    }
  };

  return (
    <textarea
      maxLength={maxLength}
      required={required}
      name={name}
      ref={register({
        maxLength,
      })}
      defaultValue=""
      className={isEmpty ? 'empty' : ''}
      onFocus={() => setHasFocus(true)}
      onBlur={checkEmpty}
      onChange={(event) => {
        if (onChange) {
          onChange(event.target.value);
        }
      }}
      placeholder={placeholder}
    />
  );
};

export default Textarea;

Textarea.propTypes = {
  placeholder: string,
  onChange: func,
  required: bool,
  name: string.isRequired,
  maxLength: number,
};

Textarea.defaultProps = {
  placeholder: '',
  required: false,
  onChange: undefined,
  maxLength: undefined,
};
