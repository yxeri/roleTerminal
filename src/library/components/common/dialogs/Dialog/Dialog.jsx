import React from 'react';
import {
  func,
  arrayOf,
  string,
  shape,
  node,
} from 'prop-types';
import Window from '../../Window/Window';

import './Dialog.scss';

const Dialog = ({
  children,
  title,
  error,
  text,
  done,
  classNames = [],
}) => (
  <Window
    done={done}
    order={10}
    title={title}
    classNames={['Dialog'].concat(classNames)}
    onClick={() => {}}
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

export default Dialog;

Dialog.propTypes = {
  done: func.isRequired,
  children: node,
  error: shape({
    type: string.isRequired,
    text: arrayOf(string).isRequired,
  }),
  title: string,
  text: string,
  classNames: arrayOf(string),
};

Dialog.defaultProps = {
  children: undefined,
  error: undefined,
  title: undefined,
  text: undefined,
  classNames: [],
};