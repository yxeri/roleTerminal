import React from 'react';
import {
  func,
  arrayOf,
  string,
  shape,
  node, number,
} from 'prop-types';
import Window from '../../Window/Window';

import './Dialog.scss';

const Dialog = ({
  children,
  title,
  error,
  text,
  done,
  onClick,
  index,
  classNames = [],
}) => (
  <Window
    index={index}
    type="dialog"
    done={done}
    title={title}
    classNames={['Dialog'].concat(classNames)}
    onClick={onClick}
  >
    {error && (
      <div className="error">
        <span>{error.message}</span>
      </div>
    )}
    {text && (
      <div>{text}</div>
    )}
    {children}
  </Window>
);

export default React.memo(Dialog);

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
  onClick: func.isRequired,
  index: number.isRequired,
};

Dialog.defaultProps = {
  children: undefined,
  error: undefined,
  title: undefined,
  text: undefined,
  classNames: [],
};
