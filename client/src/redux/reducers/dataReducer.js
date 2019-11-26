import constants from "../constants";

const initialState = {
  isAuthenticated: false,
  battleMessages: [],
  potentialUsers: [],
  leaderboard: [],
  squadMemberInfo: [],
  squadSearchInfo: [],
  squadInformationPanel: []
};

const dataReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case constants.AUTHENTICATION:
      return {
        ...state,
        ...payload
      };
    case constants.GET_ALL_BATTLE_MESSAGES:
      return {
        ...state,
        battleMessages: [...payload]
      };
    case constants.GET_LEADERBOARD:
      return {
        ...state,
        leaderboard: [...payload]
      };
    case constants.GET_POTENTIAL_BATTLES:
      return {
        ...state,
        potentialUsers: [...payload]
      };
    case constants.GET_CMD_BRD_INFO:
      return {
        ...state,
        squadMemberInfo: payload
      };
    case constants.GET_SQUAD_SEARCH_INFO:
      return {
        ...state,
        squadSearchInfo: [...payload]
      };
    case constants.GET_SQUAD_INFORMATION:
      return {
        ...state,
        squadInformationPanel: [...payload]
      };
    default:
      return state;
  }
};

export default dataReducer;
