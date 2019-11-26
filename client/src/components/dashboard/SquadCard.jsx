import React, { useState } from "react";
import { connect } from "react-redux";
// Actions
import {
  createSquad,
  getSquad,
  toggleModal,
  searchForSquad
} from "../../redux/actions/dataActions";
// Styles
import "../../styles/dashboard/squadCardStyles.scss";

function SquadCard(props) {
  let [newSquad, setNewSquad] = useState({
    squadName: "",
    searchedSquads: []
  });

  const handleCommandPanel = () => {
    props.toggleModal("command-panel");
  };

  const handleModalSquadSearch = () => {
    props.toggleModal("search-panel");
  };

  const handleSquadNameChange = e => {
    e.preventDefault();
    setNewSquad({
      ...newSquad,
      [e.target.name]: e.target.value
    });
  };

  const handleSqaudSubmit = e => {
    e.preventDefault();
  };

  const handleSquadCreation = async e => {
    if (newSquad.squadName === "" || newSquad.squadName.trim() === "") {
      setNewSquad({
        ...newSquad.squadName,
        squadName: ""
      });
      return alert("must provide squad name");
    }
    const handleCreationSave = await props.createSquad(newSquad.squadName);
    props.getSquad();
  };

  const handleSquadInformation = async => {
    props.toggleModal("squad-information");
  }

  return (
    <div id="squadCard">
      <h1>
        Squad:{" "}
        {props.squad && props.squad.squadName ? (
          <span>{props.squad.squadName}</span>
        ) : (
          <form id="squadCard__new-form" onSubmit={handleSqaudSubmit}>
            <input
              type="text"
              name="squadName"
              value={newSquad.squadName}
              onChange={handleSquadNameChange}
              id="inputSquad"
              placeholder="Create a squad?"
            />
          </form>
        )}
      </h1>
      {props.squad && props.squad.grandAdmiral ? (
        <section>
          <div className="squadCard-userTag">
            <h3>
              GrandAdmiral:{" "}
              <span>
                {props.squad.grandAdmiral
                  ? props.squad.grandAdmiral
                  : "Not Enlisted"}
              </span>
            </h3>
          </div>

          <div className="squadCard-userTag">
            <h3>
              Captain:{" "}
              {props.captain ? (
                props.captain.map((v, i) => <span key={i}>{v.username}</span>)
              ) : (
                <span> None Enlisted</span>
              )}
            </h3>
          </div>
          <div className="squadCard-userTag">
            <h3>
              LieutenantCommander:{" "}
              {props.lieutenantCommander ? (
                props.lieutenantCommander.map((v, i) => (
                  <span key={i}>{v.username}</span>
                ))
              ) : (
                <span> None Enlisted</span>
              )}
            </h3>
          </div>
          <div className="squadCard-userTag">
            <h3>
              Grunt:
              {props.grunt ? (
                props.grunt.map((v, i) => <span key={i}>{v.username}</span>)
              ) : (
                <span> None Enlisted</span>
              )}
            </h3>
          </div>
        </section>
      ) : null}

      <div id="squadCard-buttons">
        {props.squad && props.squad.grandAdmiral === props.username ? (
          <div onClick={handleCommandPanel}>
            <a>Command Panel</a>
          </div>
        ) : props.squad && props.squad.squadName ? (
          <div onClick={handleSquadInformation}>
            <a>Squad Information</a>
          </div>
        ) : (
          <section id="creation__btn-container">
            <div onClick={handleSquadCreation}>
              <a>Activate Squad</a>
            </div>

            <div onClick={handleModalSquadSearch}>
              <a>Search Squad</a>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  username: state.User.username,
  squad: state.User.squad,
  captain: state.User.squad ? state.User.squad.captain : state.User.squad,
  lieutenantCommander: state.User.squad
    ? state.User.squad.lieutenantCommander
    : state.User.squad,
  grunt: state.User.squad ? state.User.squad.grunt : state.User.squad
});

const mapActionsToProps = {
  createSquad,
  getSquad,
  toggleModal,
  searchForSquad
};

export default connect(mapStateToProps, mapActionsToProps)(SquadCard);
