import React from 'react';
import { batch, useSelector } from 'react-redux';
import { string } from 'prop-types';
import Dialog from './Dialog/Dialog';
import { getIdentityById } from '../../../redux/selectors/users';
import Button from '../sub-components/Button/Button';
import { getWhisperRoom } from '../../../redux/selectors/rooms';
import store from '../../../redux/store';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import { ReactComponent as Wallet } from '../../../icons/wallet.svg';
import { ReactComponent as Chat } from '../../../icons/chat.svg';

const IdentityDialog = ({ id, identityId }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));
  const currentIdentityId = useSelector(getCurrentIdentityId);

  return (
    <Dialog
      title={`User: ${identity.aliasName || identity.username}`}
      onClick={() => {
        store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGIDENTITY, identityId } }] }));
      }}
      done={() => store.dispatch(removeWindow({ id }))}
    >
      {currentIdentityId !== '-1' && (
        <div className="buttons">
          <Button
            stopPropagation
            type="button"
            onClick={() => batch(() => {
              store.dispatch(changeWindowOrder({
                windows: [{
                  id: `${WindowTypes.DIALOGCREATETRANSACTION}-${identityId}`,
                  value: { type: WindowTypes.DIALOGCREATETRANSACTION, toWalletId: identityId },
                }],
              }));
              store.dispatch(removeWindow({ id }));
            })}
          >
            <Wallet />
          </Button>
          <Button
            stopPropagation
            type="button"
            onClick={() => {
              const room = getWhisperRoom(store.getState(), { identityId, currentIdentityId });

              batch(() => {
                store.dispatch(changeWindowOrder({
                  windows: [{ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT, roomId: room.objectId } }],
                }));
                store.dispatch(removeWindow({ id }));
              });
            }}
          >
            <Chat />
          </Button>
        </div>
      )}
    </Dialog>
  );
};

export default React.memo(IdentityDialog);

IdentityDialog.propTypes = {
  identityId: string.isRequired,
  id: string.isRequired,
};
