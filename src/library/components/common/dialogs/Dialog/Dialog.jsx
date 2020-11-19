import React from 'react';
import {
  func,
  arrayOf,
  element,
  string,
  shape,
} from 'prop-types';
import Window from '../../Window/Window';

import './Dialog.scss';

export default function Dialog({
  children,
  title,
  error,
  text,
  done,
}) {
  return (
    <Window
      done={done}
      order={10}
      title={title}
      classNames={['dialog']}
    >
      <div className="inputs">
        {
          error
            && <div>{error.type}</div>
        }
        {
          text
            && <div>{text}</div>
        }
        {children}
      </div>
    </Window>
  );
}

Dialog.propTypes = {
  done: func.isRequired,
  children: arrayOf(element),
  error: shape({
    type: string.isRequired,
    text: arrayOf(string).isRequired,
  }),
  title: string,
  text: string,
};

Dialog.defaultProps = {
  children: undefined,
  error: undefined,
  title: undefined,
  text: undefined,
};
