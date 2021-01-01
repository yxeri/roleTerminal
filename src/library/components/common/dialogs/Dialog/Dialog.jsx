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
import Button from '../../sub-components/Button/Button';
import store from '../../../../redux/store';
import { removeWindow } from '../../../../redux/actions/windowOrder';

const Dialog = ({
  children,
  title,
  error,
  text,
  done,
  onClick,
  index,
  id,
  buttons,
  className = '',
}) => (
  <Window
    id={id}
    index={index}
    type="dialog"
    done={done}
    title={title}
    className={`Dialog ${className}`}
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
    {buttons.length > 0 && (
      <div className="buttons">
        <Button stopPropagation type="button" onClick={() => store.dispatch(removeWindow({ id }))}>
          Cancel
        </Button>
        {buttons}
      </div>
    )}
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
  className: string,
  onClick: func.isRequired,
  index: number.isRequired,
  id: string.isRequired,
  buttons: arrayOf(node),
};

Dialog.defaultProps = {
  children: undefined,
  error: undefined,
  title: undefined,
  text: undefined,
  className: '',
  buttons: undefined,
};
