import React, { useCallback, useEffect } from 'react';
import { batch, useSelector } from 'react-redux';
import { number, string } from 'prop-types';
import Dialog from './Dialog/Dialog';
import { getCurrentAccessLevel, getCurrentUser, getIdentityById } from '../../../redux/selectors/users';
import Button from '../sub-components/Button/Button';
import { getWhisperRoom } from '../../../redux/selectors/rooms';
import store from '../../../redux/store';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import { ReactComponent as Wallet } from '../../../icons/wallet.svg';
import { ReactComponent as Chat } from '../../../icons/chat.svg';
import { ReactComponent as Pin } from '../../../icons/pin.svg';
import { ReactComponent as Admin } from '../../../icons/admin.svg';
import { getTeamsByIds } from '../../../redux/selectors/teams';
import Image from '../sub-components/Image/Image';
import { updateUser } from '../../../socket/actions/users';
import { getGpsTracking } from '../../../redux/selectors/config';
import { getPositionById } from '../../../redux/selectors/positions';
import { Pronouns } from '../sub-components/selects/PronounsSelect';
import { AccessLevels } from '../../../AccessCentral';

const IdentityDialog = ({ id, identityId, index }) => {
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));
  const currentIdentityId = useSelector(getCurrentIdentityId);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const { objectId: userId, hasSeen = [], isAnonymous } = useSelector(getCurrentUser);
  const teams = useSelector((state) => getTeamsByIds(state, { ids: identity.partOfTeams }));
  const gpsTracking = useSelector(getGpsTracking);
  const position = useSelector((state) => getPositionById(state, { id: identityId }));

  useEffect(() => {
    if (!isAnonymous && !hasSeen.includes(identity.objectId)) {
      updateUser({
        userId,
        user: {
          hasSeen: hasSeen.concat([identity.objectId]),
        },
      })
        .catch((error) => console.log(error));
    }
  }, [hasSeen, identity]);

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGIDENTITY, identityId } }] }));
  }, [id, identityId]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const transferCall = useCallback(() => batch(() => {
    store.dispatch(changeWindowOrder({
      windows: [{
        id: `${WindowTypes.DIALOGCREATETRANSACTION}-${identityId}`,
        value: { type: WindowTypes.DIALOGCREATETRANSACTION, toWalletId: identityId },
      }],
    }));
    store.dispatch(removeWindow({ id }));
  }), [identityId, id]);

  const whisperCall = useCallback(() => {
    const room = getWhisperRoom(store.getState(), { identityId, currentIdentityId });

    batch(() => {
      store.dispatch(changeWindowOrder({
        windows: [{ id: WindowTypes.CHAT, value: { type: WindowTypes.CHAT, roomId: room.objectId } }],
      }));
      store.dispatch(removeWindow({ id }));
    });
  }, [identityId, currentIdentityId, id]);

  const onTrackPosition = useCallback(() => {
    batch(() => {
      store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.WORLDMAP, value: { type: WindowTypes.WORLDMAP, positionId: identityId } }] }));
      store.dispatch(removeWindow({ id }));
    });
  }, [id]);

  const onEdit = useCallback(() => {
    batch(() => {
      store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.DIALOGPROFILE, value: { type: WindowTypes.DIALOGPROFILE, identityId, edit: true } }] }));
      store.dispatch(removeWindow({ id }));
    });
  })

  const buttons = [];

  if (currentIdentityId !== '-1') {
    if (accessLevel >= AccessLevels.ADMIN) {
      buttons.push(
        <Button
          stopPropagation
          key="edit"
          type="button"
          onClick={onEdit}
        >
          <Admin />
          Edit
        </Button>
      );
    }

    buttons.push(
      <Button
        stopPropagation
        key="transfer"
        type="button"
        onClick={transferCall}
      >
        <Wallet />
      </Button>,
      <Button
        stopPropagation
        key="whisper"
        type="button"
        onClick={whisperCall}
      >
        <Chat />
      </Button>,
    );
  }

  return (
    <Dialog
      id={id}
      index={index}
      title={`User: ${identity.aliasName || identity.username}`}
      onClick={onClick}
      done={onDone}
      buttons={buttons}
    >
      {identity.image && (
        <Image
          scrollTo
          image={`/upload/images/${identity.image.thumbFileName}`}
          altText="pic"
          width={identity.image.thumbWidth}
          height={identity.image.thumbHeight}
          fullImage={`/upload/images/${identity.image.fileName}`}
          fullWidth={identity.image.width}
          fullHeight={identity.image.height}
        />
      )}
      <p>{`Name: ${identity.aliasName || identity.username}`}</p>
      <p>{`Pronouns: ${identity.pronouns.map((pronoun) => Pronouns[pronoun]).join(', ')}`}</p>
      {teams.size > 0 && (<p>{`Affiliations: ${[...teams.values()].map((team) => team.teamName).join(', ')}`}</p>)}
      {gpsTracking && position && position.coordinatesHistory[0] && (
        <p>
          Last known position:
          <Button onClick={onTrackPosition}>
            <Pin />
            Track
          </Button>
        </p>
      )}
      {identity.description && identity.description.length > 0 && (
        <div className="description">
          {identity.description.map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}
        </div>
      )}
    </Dialog>
  );
};

export default React.memo(IdentityDialog);

IdentityDialog.propTypes = {
  identityId: string.isRequired,
  id: string.isRequired,
  index: number.isRequired,
};
