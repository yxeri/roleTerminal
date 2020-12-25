export const getAllTeams = (state) => state.teams;

export const getTeamById = (state, { id }) => state.teams.get(id);
