import React, { useState } from 'react';
import {
  string,
  bool,
  func,
} from 'prop-types';
import { useFormContext } from 'react-hook-form';

const Input = ({
  onChange,
  name,
  shouldEqual,
  type = 'text',
  required = false,
  placeholder = '',
}) => {
  const { register, getValues } = useFormContext();
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);

  const checkEmpty = (event) => {
    if (hasFocus && required) {
      setIsEmpty(!event.target.value || event.target.value === '');
    }
  };

  return (
    <input
      required={required}
      name={name}
      ref={register({
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
};

Input.defaultProps = {
  placeholder: '',
  required: false,
  type: 'text',
  onChange: undefined,
  shouldEqual: undefined,
};
