import constants from "../constants";
import axios from "axios";

export const selectCharacter = userData => dispatch => {
  const { name } = selectCharacter;

  axios
    .get(`https://swapi.co/api/people/?search=${name}`)
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    });
};

export const refreshCharacter = () => dispatch => {
  axios.defaults.headers.common["Authorization"] = localStorage.getItem(
    "token"
  );
  axios
    .get(`/user/dashboard-data`)
    .then(userData => {
      axios
        .get(
          `https://swapi.co/api/people/?search=${userData.data.allUserInfo.userCharacter.characterName}`
        )
        .then(character => {
          dispatch({
            type: constants.REFRESH_CHARACTER,
            payload: character.data.results[0]
          });
          axios
            .get(character.data.results[0].species[0])
            .then(fetchedSpecies => {
              dispatch({
                type: constants.REFRESH_CHARACTER,
                payload: { species: fetchedSpecies.data.name }
              });
              dispatch({
                type: constants.AUTHENTICATION,
                payload: {
                  isAuthenticated: true
                }
              });
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(err => {
          console.log(err);
        });
      dispatch({
        type: constants.REFRESH,
        payload: userData.data.allUserInfo
      });
      dispatch({ type: constants.CLEAR_ERRORS });
    })
    .catch(err => console.log(err));
};

// Get user Image
export const getUserImage = character => dispatch => {
  console.log(character);
  if (!character) return;
  console.log("asrseesasdafas");

  //   axios
  //     .get(
  //       ''
  //     )
  //     .then(res => {
  //       console.log(res.data)
  //       return res.data.image_results[0].thumbnail;
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });
};

// - Refresh level after battle
export const levelRefresh = () => dispatch => {
  axios
    .get(`/user/level`)
    .then(res => {
      console.log(res.data);
      dispatch({
        type: constants.REFRESH_LEVEL,
        payload: res.data
      });
    })
    .catch(err => console.log(err));
};

export const logout = () => {
  localStorage.clear();
  window.location.href = "/";
};
