import React, { useEffect, useState } from 'react';
import {
  string,
  bool,
  func, number,
} from 'prop-types';
import { useFormContext } from 'react-hook-form';

import './Input.scss';

const Input = ({
  onChange,
  name,
  shouldEqual,
  maxLength,
  minLength,
  checked,
  type = 'text',
  required = false,
  placeholder = '',
}) => {
  const { register, getValues, unregister } = useFormContext();
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const checkEmpty = (event) => {
    if (hasFocus && required) {
      setIsEmpty(!event.target.value || event.target.value === '');
    }
  };

  useEffect(() => () => unregister(name), []);

  return (
    <input
      defaultChecked={checked}
      minLength={minLength}
      maxLength={maxLength}
      required={required}
      name={name}
      ref={register({
        maxLength,
        minLength,
        validate: (value) => (!shouldEqual || value === getValues(shouldEqual)) || `Must match ${shouldEqual}`,
      })}
      type={type}
      defaultValue=""
      className={`Input ${isEmpty ? 'empty' : ''}`}
      onFocus={() => {
        if (!hasFocus) {
          setHasFocus(true);
        } else if (isEmpty) {
          setIsEmpty(false);
        }
      }}
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

export default React.memo(Input);

Input.propTypes = {
  onChange: func,
  required: bool,
  placeholder: string,
  type: string,
  name: string.isRequired,
  shouldEqual: string,
  maxLength: number,
  minLength: number,
  checked: bool,
};

Input.defaultProps = {
  placeholder: '',
  required: false,
  type: 'text',
  onChange: undefined,
  shouldEqual: undefined,
  maxLength: undefined,
  minLength: undefined,
  checked: undefined,
};
