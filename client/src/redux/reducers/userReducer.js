import constants from "../constants";

const initialState = {
  username: "",
  email: "",
  squad: {},
  userCharacter: {
    characterName: "",
    characterId: 0,
    stats: {
      attackMultiplier: 0,
      defenseMultiplier: 0
    }
  }
};

const userReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case constants.LOGIN:
      return {
        ...state,
        ...payload
      };
    case constants.REFRESH:
      return {
        ...state,
        ...payload
      };
    case constants.REFRESH_LEVEL:
      return {
        ...state,
        userCharacter: {
          ...state.userCharacter,
          rpgInfo: { ...payload }
        }
      };
    case constants.REFRESH_CHARACTER:
      return {
        ...state,
        userCharacter: {
          ...state.userCharacter,
          ...payload
        }
      };
    case constants.GET_SQUAD:
      return {
        ...state,
        squad: { ...payload }
      };
    default:
      return state;
  }
};

export default userReducer;
