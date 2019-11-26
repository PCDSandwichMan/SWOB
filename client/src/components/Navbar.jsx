import React from "react";
// Styles
import "../styles/allComponentStyles/navbarStyles.scss";
// Redux
import { connect } from "react-redux";
// Actions
import { logout } from "../redux/actions/userActions";
import { toggleModal } from "../redux/actions/dataActions";

function navbar(props) {
  const handleBattleMenu = () => {
    props.toggleModal("battle-panel");
  };

  return (
    <div id="navbar">
      <i
        id="navbar__logout"
        onClick={() => {
          props.logout();
        }}
        className="fas fa-sign-out-alt"
      />
      <h1>StarWars Online Battles</h1>
      <div>
        {/* <i className="fab fa-old-republic" /> */}
        <i onClick={handleBattleMenu} className="fas fa-journal-whills" />
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  state
});

const mapActionsToProps = {
  logout,
  toggleModal
};

export default connect(mapStateToProps, mapActionsToProps)(navbar);
