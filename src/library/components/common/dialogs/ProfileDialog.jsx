import React, { useCallback, useState } from 'react';
import { batch, useSelector } from 'react-redux';
import { bool, number, string } from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';

import Dialog from './Dialog/Dialog';
import {
  getCurrentAccessLevel,
  getCurrentUserIdentitiesNames,
  getIdentityById,
} from '../../../redux/selectors/users';
import Button from '../sub-components/Button/Button';
import store from '../../../redux/store';
import { getCurrentIdentityId } from '../../../redux/selectors/userId';
import { changeWindowOrder, removeWindow } from '../../../redux/actions/windowOrder';
import { WindowTypes } from '../../../redux/reducers/windowOrder';
import { getTeamsByIds } from '../../../redux/selectors/teams';
import Image from '../sub-components/Image/Image';
import IdentityPicker from '../lists/IdentityPicker/IdentityPicker';
import { getDisallowProfileEdit, getGpsTracking, getPermissions } from '../../../redux/selectors/config';
import { getPositionById } from '../../../redux/selectors/positions';
import { ReactComponent as Pin } from '../../../icons/pin.svg';
import ImageUpload from '../sub-components/ImageUpload/ImageUpload';
import Input from '../sub-components/Input/Input';
import PronounsSelect, { Pronouns } from '../sub-components/selects/PronounsSelect';
import Textarea from '../sub-components/Textarea/Textarea';
import { updateUser } from '../../../socket/actions/users';
import { updateAlias } from '../../../socket/actions/aliases';
import { AccessLevels } from '../../../AccessCentral';
import Select from '../sub-components/selects/Select/Select';

const ProfileDialog = ({
  id,
  index,
  identityId,
  edit = false,
}) => {
  const formMethods = useForm();
  const disallowProfileEdit = useSelector(getDisallowProfileEdit);
  const [editing, setEditing] = useState(edit);
  const currentIdentityId = useSelector(getCurrentIdentityId);
  const currentUserIdentities = useSelector(getCurrentUserIdentitiesNames);
  const accessLevel = useSelector(getCurrentAccessLevel);
  const identity = useSelector((state) => getIdentityById(state, { id: identityId || currentIdentityId }));
  const teams = useSelector((state) => getTeamsByIds(state, { ids: identity.partOfTeams }));
  const position = useSelector((state) => getPositionById(state, { id: identityId || currentIdentityId }));
  const gpsTracking = useSelector(getGpsTracking);
  const permissions = useSelector(getPermissions);

  const onClick = useCallback(() => {
    store.dispatch(changeWindowOrder({ windows: [{ id, value: { type: WindowTypes.DIALOGPROFILE, identityId } }] }));
  }, [id]);

  const onDone = useCallback(() => store.dispatch(removeWindow({ id })), [id]);

  const onSubmit = ({
    name,
    pronouns,
    image,
    description,
    status,
    occupation,
  }) => {
    const newImage = image && (!identity.image || image.source !== `/upload/images/${identity.image.fileName}`)
      ? image
      : undefined;

    if (identity.aliasName) {
      const alias = {
        pronouns,
        status,
        occupation,
        description: description ? description.split('\n') : undefined,
        aliasName: name !== identity.aliasName ? name : undefined,
      };

      updateAlias({
        alias,
        resetImage: !image && identity.image,
        image: newImage,
        aliasId: identityId || currentIdentityId,
      })
        .then(() => setEditing(false))
        .catch((error) => console.log(error));

      return;
    }

    const user = {
      pronouns,
      status,
      occupation,
      description: description ? description.split('\n') : undefined,
      username: name !== identity.username ? name : undefined,
    };

    updateUser({
      user,
      resetImage: !image && identity.image,
      image: newImage,
      userId: identityId || currentIdentityId,
    })
      .then(() => setEditing(false))
      .catch((error) => console.log(error));
  };

  const onTrackPosition = useCallback(() => {
    batch(() => {
      store.dispatch(changeWindowOrder({ windows: [{ id: WindowTypes.WORLDMAP, value: { type: WindowTypes.WORLDMAP, positionId: currentIdentityId } }] }));
      store.dispatch(removeWindow({ id }));
    });
  }, [id]);

  const buttons = [];

  if (
    !editing
      && (!disallowProfileEdit || accessLevel >= AccessLevels.ADMIN)
      && (!identityId || accessLevel >= AccessLevels.ADMIN || currentUserIdentities.find((userIdentity) => userIdentity.objectId === identityId))
  ) {
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
    if (accessLevel >= AccessLevels.MODERATOR) {
      if (!identity.isBanned) {
        buttons.push((
          <Button
            stopPropagation
            key="ban"
            type="button"
            onClick={() => {}}
          >
            Ban
          </Button>
        ));
      } else {
        buttons.push((
          <Button
            stopPropagation
            key="unban"
            type="button"
            onClick={() => {}}
          >
            Unban
          </Button>
        ));
      }
    }

    buttons.push((
      <Button
        stopPropagation
        key="update"
        type="submit"
        onClick={() => formMethods.handleSubmit(onSubmit)()}
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
          {!identityId && (
            <div className="identity">
              <span>You are:</span>
              <IdentityPicker />
            </div>
          )}
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
          {identity.status && <p>{`Status: ${identity.status}`}</p>}
          <p>{`Pronouns: ${identity.pronouns.map((pronoun) => Pronouns[pronoun]).join(', ')}`}</p>
          {teams.size > 0 && (<p>{`Affiliations: ${[...teams.values()].map((team) => team.teamName).join(', ')}`}</p>)}
          {identity.occupation && <p>{`Occupation: ${identity.occupation}`}</p>}
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
        </>
      )}
      {editing && (
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            {!identityId && (
              <div className="identity">
                <span>You are:</span>
                <IdentityPicker />
              </div>
            )}
            <ImageUpload
              image={identity.image ? { source: `/upload/images/${identity.image.fileName}` } : undefined}
            />
            <Input
              required
              name="name"
              maxLength={30}
              placeholder="Name"
              type="text"
              defaultValue={identity.aliasName || identity.username}
            />
            {accessLevel >= AccessLevels.ADMIN && (
              <Select
                key="accessLevel"
                name="accessLevel"
                defaultValue={accessLevel}
              >
                {Object.keys(AccessLevels)
                  .filter((key) => AccessLevels[key] >= AccessLevels.STANDARD && AccessLevels[key] <= AccessLevels.ADMIN)
                  .map((key) => <option value={AccessLevels[key]}>{key}</option>)}
              </Select>
            )}
            <PronounsSelect preselected={identity.pronouns} />
            {accessLevel >= permissions.UpdateUserStatus.accessLevel && (
              <Input
                name="status"
                placeholder="Status"
                type="text"
                defaultValue={identity.status}
              />
            )}
            {accessLevel >= permissions.UpdateUserOccupation.accessLevel && (
              <Input
                name="occupation"
                placeholder="Occupation"
                type="text"
                defaultValue={identity.occupation}
              />
            )}
            <Textarea
              name="description"
              placeholder="Description"
              maxLength={300}
            />
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
  identityId: string,
  edit: bool,
};

ProfileDialog.defaultProps = {
  identityId: undefined,
  edit: false,
};
