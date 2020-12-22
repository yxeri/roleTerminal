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
  onClick,
  classNames = [],
}) => (
  <Window
    done={done}
    title={title}
    classNames={['Dialog'].concat(classNames)}
    onClick={onClick}
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
};

Dialog.defaultProps = {
  children: undefined,
  error: undefined,
  title: undefined,
  text: undefined,
  classNames: [],
};
