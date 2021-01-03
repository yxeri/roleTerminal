import React, { useEffect, useRef, useState } from 'react';
import {
  bool,
  func, number,
  string,
} from 'prop-types';
import { useFormContext, useWatch } from 'react-hook-form';

import './Textarea.scss';

const Textarea = ({
  name,
  maxLength,
  onKeyDown,
  required = false,
  placeholder = '',
}) => {
  const { register, control } = useFormContext();
  const text = useWatch({ control, name });
  const [hasFocus, setHasFocus] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const inputRef = useRef(null);

  const resize = () => {
    if (inputRef.current) {
      const textarea = inputRef.current;

      if (!textarea.style.height || (textarea.scrollHeight.toString() !== textarea.style.height.split('px')[0])) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        inputRef.current.scrollIntoView();
      }
    }
  };

  useEffect(() => {
    resize();
  }, [text]);

  const checkEmpty = (event) => {
    const value = event.target.value.trim();

    if (hasFocus && required) {
      setIsEmpty(value !== '');
    }
  };

  return (
    <textarea
      onKeyDown={onKeyDown}
      rows={1}
      maxLength={maxLength}
      required={required}
      name={name}
      ref={(element) => {
        inputRef.current = element;
        register(element, {
          maxLength,
        });
      }}
      defaultValue=""
      className={`Textarea ${isEmpty ? 'empty' : ''}`}
      onFocus={() => setHasFocus(true)}
      onBlur={checkEmpty}
      placeholder={placeholder}
    />
  );
};

export default Textarea;

Textarea.propTypes = {
  placeholder: string,
  required: bool,
  name: string.isRequired,
  maxLength: number,
  onKeyDown: func,
};

Textarea.defaultProps = {
  placeholder: '',
  required: false,
  maxLength: undefined,
  onKeyDown: undefined,
};
