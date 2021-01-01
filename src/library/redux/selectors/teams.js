import createCachedSelector from 're-reselect';

export const getAllTeams = (state) => state.teams;

export const getTeamById = (state, { id }) => state.teams.get(id);

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
