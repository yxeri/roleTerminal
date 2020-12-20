import React from 'react';
import {
  arrayOf,
  bool,
  func,
  node,
  oneOf, string,
} from 'prop-types';

import './Button.scss';

const Button = React.forwardRef(({
  onClick,
  children,
  disabled,
  stopPropagation,
  classNames = [''],
  type = 'button',
}, ref) => (
  <button
    ref={ref}
    className={`${['Button'].concat(classNames).join(' ')}`}
    disabled={disabled}
    type={type} /* eslint-disable-line react/button-has-type */
    onClick={(event) => {
      if (stopPropagation) {
        event.stopPropagation();
      }

      onClick(event);
    }}
  >
    {children}
  </button>
));

export default Button;

Button.propTypes = {
  onClick: func.isRequired,
  children: node.isRequired,
  type: oneOf(['button', 'submit']),
  disabled: bool,
  classNames: arrayOf(string),
  stopPropagation: bool,
};

Button.defaultProps = {
  type: 'button',
  disabled: undefined,
  classNames: [],
  stopPropagation: undefined,
};
