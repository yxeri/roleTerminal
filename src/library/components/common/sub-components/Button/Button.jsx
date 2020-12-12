import React from 'react';
import {
  func,
  node,
  oneOf,
} from 'prop-types';

import './Button.scss';

export default function Button({
  onClick,
  children,
  type = 'button',
}) {
  return (
    <button
      type={type} /* eslint-disable-line react/button-has-type */
      onClick={(event) => { onClick(event); }}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  onClick: func.isRequired,
  children: node.isRequired,
  type: oneOf(['button', 'submit']),
};

Button.defaultProps = {
  type: 'button',
};
