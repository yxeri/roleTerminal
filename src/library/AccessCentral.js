export const AccessLevels = {
  ANONYMOUS: 0,
  STANDARD: 1,
  PRIVILEGED: 2,
  MODERATOR: 3,
  ADMIN: 4,
  SUPERUSER: 5,
  GOD: 6,
};

/**
 * Checks if user has access, is admin or can see the object.
 * @param {Object} params Parameter.
 * @param {Object} params.objectToAccess Object to access.
 * @param {Object} params.toAuth Object to auth.
 * @returns {Object} Does the user have access to the object?
 */
export const hasAccessTo = ({
  objectToAccess,
  toAuth,
  skipAdminLevel = false,
}) => {
  if (!objectToAccess || !toAuth) {
    return {
      canSee: false,
      hasFullAccess: false,
      hasAccess: false,
    };
  }

  const {
    ownerId,
    ownerAliasId,
    teamId,
    isPublic,
    visibility,
    teamIds = [],
    userIds = [],
    userAdminIds = [],
    teamAdminIds = [],
  } = objectToAccess;
  const {
    hasFullAccess,
    partOfTeams = [],
    accessLevel = AccessLevels.ANONYMOUS,
    objectId: authUserId,
    teamIds: authTeamIds = [],
    aliases = [],
  } = toAuth;

  const foundOwnerAlias = ownerAliasId && aliases.includes(ownerAliasId);
  const partOfTeam = teamId && partOfTeams.includes(teamId);

  const userHasAccess = userIds.concat([ownerId]).includes(authUserId);
  const teamHasAccess = partOfTeam || teamIds.find((id) => authTeamIds.includes(id));
  const aliasHasAccess = foundOwnerAlias || aliases.find((aliasId) => userIds.includes(aliasId));
  const userHasAdminAccess = userAdminIds.includes(authUserId);
  const aliasHasAdminAccess = foundOwnerAlias || aliases.find((aliasId) => userAdminIds.includes(aliasId));
  const teamHasAdminAccess = partOfTeam || teamAdminIds.find((adminId) => authTeamIds.includes(adminId));
  const isAdmin = ownerId === authUserId || hasFullAccess || !skipAdminLevel ? accessLevel >= AccessLevels.ADMIN : false;

  return {
    canSee: isAdmin || isPublic || userHasAccess || teamHasAccess || aliasHasAccess || accessLevel >= visibility,
    hasAccess: isAdmin || isPublic || userHasAccess || teamHasAccess || aliasHasAccess,
    hasFullAccess: isAdmin || userHasAdminAccess || teamHasAdminAccess || aliasHasAdminAccess,
  };
};
