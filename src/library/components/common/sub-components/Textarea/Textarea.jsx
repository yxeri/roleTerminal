import React, { useEffect, useRef, useState } from 'react';
import {
  bool,
  func, node, number,
  string,
} from 'prop-types';
import { useFormContext, useWatch } from 'react-hook-form';

import './Textarea.scss';

const Textarea = ({
  name,
  maxLength,
  onKeyDown,
  onChange,
  label,
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

      if (document.activeElement === textarea && (!textarea.style.height || (textarea.scrollHeight.toString() !== textarea.style.height.split('px')[0]))) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        inputRef.current.scrollIntoView({ block: 'nearest' });
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
    <div>
      {label && <span>{label}</span>}
      <textarea
        onChange={onChange}
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
    </div>
  );
};

export default Textarea;

Textarea.propTypes = {
  placeholder: string,
  required: bool,
  name: string.isRequired,
  maxLength: number,
  onKeyDown: func,
  onChange: func,
  label: node,
};

Textarea.defaultProps = {
  placeholder: '',
  required: false,
  maxLength: undefined,
  onKeyDown: undefined,
  onChange: undefined,
  label: undefined,
};
