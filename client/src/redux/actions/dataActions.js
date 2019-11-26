import constants from "../constants";
import axios from "axios";

const authSet = token => {
  const formatToken = `Bearer ${token}`;
  localStorage.setItem("token", formatToken);
  axios.defaults.headers.common["Authorization"] = formatToken;
};

// - login user
export const loginUser = userData => dispatch => {
  axios
    .post(`${constants.BASE_URL_DEV}/data/login`, userData)
    .then(userRes => {
      authSet(userRes.data.token);
      dispatch({
        type: constants.LOGIN,
        payload: {
          username: userRes.data.user.username,
          userCharacter: userRes.data.character
        }
      });
      dispatch({
        type: constants.AUTHENTICATION,
        payload: {
          isAuthenticated: true
        }
      });
    })
    .catch(err => {
      dispatch({
        type: constants.ADD_ERRORS,
        payload: {
          errors: err.response ? err.response.data : err
        }
      });
    });
};

// - Create new user
export const createUser = userData => dispatch => {
  axios
    .post(`${constants.BASE_URL_DEV}/user/new`, userData)
    .then(userRes => {
      authSet(userRes.data.token);
      dispatch({
        type: constants.REFRESH,
        payload: userRes.data.newUser
      });
      dispatch({
        type: constants.AUTHENTICATION,
        payload: {
          isAuthenticated: true
        }
      });
    })
    .catch(err => {
      dispatch({
        type: constants.ADD_ERRORS,
        payload: {
          errors: err.response.data
        }
      });
      console.log(err.response.data);
    });
};

// - Get Battle Messages For User
export const getBattleMessages = type => dispatch => {
  axios
    .get(`${constants.BASE_URL_DEV}/notifications/messages/${type}`)
    .then(battleMessages => {
      dispatch({
        type: constants.GET_ALL_BATTLE_MESSAGES,
        payload: battleMessages.data
      });
    })
    .catch(errors => {
      // console.log(errors.response ? errors.response.data : errors.response);
      dispatch({
        type: constants.ADD_ERRORS,
        payload: errors
      });
    });
};

// - Gets LeaderBoard users
export const getLeaderBoardUsers = () => dispatch => {
  axios
    .get(`${constants.BASE_URL_DEV}/data/leaderboard`)
    .then(data => {
      dispatch({
        type: constants.GET_LEADERBOARD,
        payload: data.data
      });
    })
    .catch(errors => {
      console.log(errors);
      dispatch({
        type: constants.ADD_ERRORS,
        payload: errors
      });
    });
};

// - Handles Bot Battles
export const handleBotBattle = () => async dispatch => {
  let success;
  const botBattleSave = await axios
    .post(`${constants.BASE_URL_DEV}/notifications/battle`, {
      battleType: "bot"
    })
    .then(result => {
      success = true;
    })
    .catch(err => {
      success = false;
      console.log(err.response);
    });
  return success;
};

// - Handles Online Battles
export const handleOnlineBattle = () => async dispatch => {
  let success;
  const botBattleSave = await axios
    .post(`${constants.BASE_URL_DEV}/notifications/battle`, {
      battleType: "online"
    })
    .then(result => {
      success = true;
    })
    .catch(err => {
      success = false;
      console.log(err.response);
    });
  return success;
};

// - Used in modal for possible matches
export const getPossibleMatchup = () => dispatch => {
  axios
    .get(`${constants.BASE_URL_DEV}/data/getBattleUsers`)
    .then(users => {
      dispatch({
        type: constants.GET_POTENTIAL_BATTLES,
        payload: users.data
      });
    })
    .catch(errors => {
      console.log(errors);
      dispatch({
        type: constants.ADD_ERRORS,
        payload: errors.data
      });
    });
};

// - Get user squad
export const getSquad = () => dispatch => {
  axios
    .get(`${constants.BASE_URL_DEV}/squad/get`)
    .then(res => {
      dispatch({
        type: constants.GET_SQUAD,
        payload: { ...res.data }
      });
    })
    .catch(err => console.log(err));
};

//  - Create new squad
export const createSquad = squadData => async dispatch => {
  if (squadData.trim() === "") return alert("must provide squad name");
  let success;

  const handleCreations = await axios
    .post(`${constants.BASE_URL_DEV}/squad/create`, { squadName: squadData })
    .then(data => {
      console.log(data);
      success = true;
    })
    .catch(err => {
      console.log(err);
      success = false;
    });
  return success;
};

// - For modal toggling
export const toggleModal = modalState => dispatch => {
  dispatch({
    type: constants.TOGGLE_MODAL,
    payload: modalState
  });
};

//  - Get sqaud info for command board
export const getCmdBrdInfo = () => dispatch => {
  axios
    .get(`${constants.BASE_URL_DEV}/squad/command-panel-info`)
    .then(res => {
      // console.log(res.data);
      dispatch({
        type: constants.GET_CMD_BRD_INFO,
        payload: res.data
      });
    })
    .catch(err => {
      console.log(err);
    });
};

// Save squad changes from command panel
export const saveSquadChanges = squadChanges => async dispatch => {
  if (
    squadChanges.squadName.trim() === "" &&
    squadChanges.removeMembers.length >= 0
  ) {
    return;
  }
  let success;
  const saveSquadChanges = await axios
    .post(`${constants.BASE_URL_DEV}/squad/update-squad`, {
      squadName: squadChanges.squadName,
      removeMembers: squadChanges.removeMembers
    })
    .then(res => {
      success = true;
    })
    .catch(err => {
      console.log(err);
      success = false;
    });
  return success;
};

// - User submits reset request
export const reqPasswordReset = email => async dispatch => {
  let success = false;
  const sendReset = await axios
    .post(`${constants.BASE_URL_DEV}/data/reset/`, { email })
    .then(res => {
      console.log(res.data);
      if (res.data.reset === "reset verified and sent") success = true;
    })
    .catch(err => console.log(err));
  return success;
};

// - User clicks on link from email and this validates the token in the param for the link
export const checkResetToken = paramToken => async dispatch => {
  let success = false;
  const checkToken = await axios
    .get(`${constants.BASE_URL_DEV}/data/reset/${paramToken}`)
    .then(res => {
      if (res.data.token) success = true;
    })
    .catch(err => console.log(err));
  return success;
};

// - One again verifies the token and validates passwords then persists
export const postPasswordReset = (passwords, paramToken) => async dispatch => {
  let success = false;
  const sendReset = await axios
    .post(`${constants.BASE_URL_DEV}/data/reset/${paramToken}`, {
      password: passwords.password,
      confirmPassword: passwords.confirmPassword
    })
    .then(res => {
      console.log(res.data);
      if (
        res.data.passwordReset ===
        "Your password has been reset. You are now able to login."
      )
        success = true;
    })
    .catch(err => console.log(err.response));
  return success;
};

export const searchForSquad = squadName => async dispatch => {
  let response = {};
  const handleSearch = await axios
    .get(`${constants.BASE_URL_DEV}/squad/${squadName}`)
    .then(res => {
      console.log(res.data);
      response = res.data;
      dispatch({
        type: constants.GET_SQUAD_SEARCH_INFO,
        payload: res.data
      });
    })
    .catch(err => {
      console.log(err.response);
      response = err;
    });
  return response;
};

export const sendJoinRequest = squadName => dispatch => {
  console.log(squadName);
  axios
    .post(`${constants.BASE_URL_DEV}/squad/join/request`, {
      squadName
    })
    .then(res => {
      console.log(res.data);
    })
    .catch(err => console.log(err));
};

export const handleJoinRequestResponse = decisionData => async dispatch => {
  const handleDecision = await axios
    .post(`${constants.BASE_URL_DEV}/squad/handle-request`, {
      requesterId: decisionData.userId,
      decision: decisionData.decision
    })
    .then(res => {
      console.log(res.data);
    })
    .catch(err => {
      console.log(err);
    });
};

export const removeUserFromSquad = users => dispatch => {
  axios
    .post(`${constants.BASE_URL_DEV}/squad/delete/members`, { userIds: users })
    .then(res => res.data)
    .catch(err => console.log(err));
};

export const squadInformationPanel = () => dispatch => {
  axios
    .get(`${constants.BASE_URL_DEV}/squad/squad-information/panel`)
    .then(res => {
      dispatch({
        type: constants.GET_SQUAD_INFORMATION,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};
