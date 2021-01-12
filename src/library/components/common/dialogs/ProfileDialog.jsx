import React, { useCallback, useEffect, useState } from 'react';
import { batch, useSelector } from 'react-redux';
import { number, string } from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';

import Dialog from './Dialog/Dialog';
import { getCurrentUser, getIdentityById } from '../../../redux/selectors/users';
import Button from '../sub-components/Button/Button';
import { getWhisperRoom } from '../../../redux/selectors/rooms';
import store from '../../../redux/store';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import { getTeamsByIds } from '../../../redux/selectors/teams';
import Image from '../sub-components/Image/Image';
import IdentityPicker from '../lists/IdentityPicker/IdentityPicker';
import { ReactComponent as Wallet } from '../../../icons/wallet.svg';
import { getDisallowProfileEdit } from '../../../redux/selectors/config';


const ProfileDialog = ({ id, index }) => {
  const formMethods = useForm();
  const disallowProfileEdit = useSelector(getDisallowProfileEdit);
  const [editing, setEditing] = useState(false);
  const identityId = useSelector(getCurrentIdentityId);
  const identity = useSelector((state) => getIdentityById(state, { id: identityId }));
  const teams = useSelector((state) => getTeamsByIds(state, { ids: identity.partOfTeams }));

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGPROFILE } }] }));
  }, [id]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onSubmit = () => {

  };

  const buttons = [];

  if (!disallowProfileEdit && !editing) {
    buttons.push((
      <Button
        stopPropagation
        key="edit"
        type="button"
        onClick={() => setEditing(true)}
      >
        Edit
      </Button>
    ));
  }

  if (editing) {
    buttons.push((
      <Button
        stopPropagation
        key="cancel"
        type="button"
        onClick={() => setEditing(false)}
      >
        Cancel
      </Button>
    ));
    buttons.push((
      <Button
        stopPropagation
        key="update"
        type="submit"
        onClick={() => {
          setEditing(false);
        }}
      >
        Update
      </Button>
    ));
  }

  return (
    <Dialog
      id={id}
      index={index}
      title={`Profile: ${identity.aliasName || identity.username}`}
      onClick={onClick}
      done={onDone}
      buttons={buttons}
    >
      {!editing && (
        <>
          <div className="identity">
            <span>You are:</span>
            <IdentityPicker />
          </div>
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
          {teams.size > 0 && (<p>{`Affiliations: ${[...teams.values()].map((team) => team.teamName).join(', ')}`}</p>)}
          {identity.description && identity.description.length > 0 && (
            <div className="description">
              {identity.description.map((line, lineIndex) => <p key={lineIndex}>{line}</p>)}
            </div>
          )}
        </>
      )}
      {editing && (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <div className="identity">
              <span>You are:</span>
              <IdentityPicker />
            </div>
          </form>
        </FormProvider>
      )}
    </Dialog>
  );
};

export default React.memo(ProfileDialog);

ProfileDialog.propTypes = {
  id: string.isRequired,
  index: number.isRequired,
};
