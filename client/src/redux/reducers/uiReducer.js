import constants from "../constants";

const initialState = {
  errors: [],
  modalStatus: false,
  modalState: ""
};

const uiReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case constants.ADD_ERRORS:
      return {
        ...state,
        errors: [payload]
      };
    case constants.CLEAR_ERRORS:
      return {
        ...state,
        errors: initialState.errors
      };
    case constants.TOGGLE_MODAL:
      return {
        ...state,
        modalStatus: !state.modalStatus,
        modalState: payload
      };
    default:
      return state;
  }
};

export default uiReducer;
