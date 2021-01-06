import React from 'react';
import { useSelector } from 'react-redux';
import { node, string } from 'prop-types';

import { Modes } from '../../../../redux/reducers/mode';
import { getMode } from '../../../../redux/selectors/mode';

const Help = ({ id, children }) => {
  const mode = useSelector(getMode);

  return (
    <>
      {mode.mode === Modes.HELP && mode.target === id && (
        <div className="helpOverlay">
          {children}
        </div>
      )}
    </>
  );
};

export default React.memo(Help);

Help.propTypes = {
  id: string.isRequired,
  children: node.isRequired,
};
