import React from 'react';
import {
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
  className = '',
  type = 'button',
}, ref) => (
  <button
    ref={ref}
    className={`Button ${className}`}
    disabled={disabled}
    type={type} /* eslint-disable-line react/button-has-type */
    onClick={(event) => {
      onClick(event);

      if (stopPropagation) {
        event.stopPropagation();
      }
    }}
  >
    {children}
  </button>
));

export default React.memo(Button);

Button.propTypes = {
  onClick: func.isRequired,
  children: node.isRequired,
  type: oneOf(['button', 'submit']),
  disabled: bool,
  className: string,
  stopPropagation: bool,
};

Button.defaultProps = {
  type: 'button',
  disabled: undefined,
  className: '',
  stopPropagation: undefined,
};
