import React, { useEffect } from "react";
import { connect } from "react-redux";
// Actions
import {
  getBattleMessages,
  handleBotBattle,
  getPossibleMatchup
} from "../redux/actions/dataActions";
import { toggleModal } from "../redux/actions/dataActions";
// styles
import "../styles/modals/generalModal.scss";
// modal faces
import BattleScreen from "./modalStates/BattleScreen";
import CommandPanel from "./modalStates/CommandPanel";
import SquadSearch from "./modalStates/SquadSearch";
import SquadInformation from "./modalStates/SquadInformation";

function GeneralModal(props) {
  useEffect(() => {
    props.getBattleMessages("battle");
    props.getPossibleMatchup();
  }, [props.userInfo]);

  const handleModalToggle = () => {
    props.toggleModal("");
  };

  return (
    <div id="generalModal">
      <div id="generalModal__overlay"></div>
      {/* // - Container Top */}
      <div id="generalModal__container">
        <div onClick={handleModalToggle} id="container__close">
          <h1>X</h1>
        </div>
        {props.modalState === "battle-panel" ? <BattleScreen /> : null}
        {props.modalState === "command-panel" ? <CommandPanel /> : null}
        {props.modalState === "search-panel" ? <SquadSearch /> : null}
        {props.modalState === "squad-information" ? <SquadInformation /> : null}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  userInfo: state.User,
  modalState: state.UI.modalState,
  battleMessages: state.Data.battleMessages,
  users: state.Data.potentialUsers
});

const mapActionsToProps = {
  getBattleMessages,
  handleBotBattle,
  getPossibleMatchup,
  toggleModal
};

export default connect(mapStateToProps, mapActionsToProps)(GeneralModal);
