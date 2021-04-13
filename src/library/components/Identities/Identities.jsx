import React, { useCallback } from 'react';
import { number, string } from 'prop-types';
import IdentityList from '../common/lists/IdentityList/IdentityList';

import Window from '../common/Window/Window';
import store from '../../redux/store';
import { changeWindowOrder, removeWindow } from '../../redux/actions/windowOrder';
import { WindowTypes } from '../../redux/reducers/windowOrder';

import './Identities.scss';

const Identities = ({
  id,
  index,
}) => {
  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.IDENTITIES } }] }));
  }, []);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  return (
    <Window
      id={id}
      index={index}
      done={onDone}
      className="Identities"
      title="Users"
      onClick={onClick}
    >
      <IdentityList
        alwaysExpanded
        hideTitle
        dropdown={false}
      />
    </Window>
  );
};

export default React.memo(Identities);

Identities.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
