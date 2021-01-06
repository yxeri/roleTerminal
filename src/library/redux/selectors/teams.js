import createCachedSelector from 're-reselect';

export const getAllTeams = (state) => state.teams;

export const getTeamById = (state, { id }) => state.teams.get(id);

export const getTeamIdsNames = createCachedSelector(
  [getAllTeams],
  (teams) => [...teams.values()].map((team) => ({ objectId: team.objectId, teamName: team.teamName, shortName: team.shortName })),
)(() => 'team-ids');

export const getTeamsByIds = createCachedSelector(
  [
    getAllTeams,
    (_, { ids }) => ids,
  ],
  (teams, ids) => {
    const foundTeams = new Map();

    ids.forEach((id) => foundTeams.set(id, teams.get(id)));

    return foundTeams;
  },
)((_, { ids }) => `teams-${ids.join(ids)}`);
