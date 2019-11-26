import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
// Actions
import {
  searchForSquad,
  sendJoinRequest,
} from "../../redux/actions/dataActions";
// Styles
import "../../styles/modals/modalStates/searchPanel.scss";

function SquadSearch(props) {
  const [squads, setSquads] = useState({
    squadName: "",
    allSquads: []
  });

  const handleSquadSearch = async e => {
    e.preventDefault();
    const handleSearch = await props.searchForSquad(squads.squadName);
    if (!handleSearch || handleSearch.status === 404) {
      return;
      setSquads({
        ...squads,
        allSquads: ["Squad not found with this name"]
      });
    }
    setSquads({
      ...squads,
      allSquads: [handleSearch.data]
    });
  };

  const handleChange = e => {
    setSquads({
      ...squads,
      [e.target.name]: e.target.value
    });
  };

  const handleJoinReq = e => {
    const squadName = document
      .getElementById("squadName")
      .innerHTML.split("Squad: ")[1];
    props.sendJoinRequest(squadName);
  };

  return (
    <div id="search-panel">
      <div id="search__content">
        <form onSubmit={handleSquadSearch}>
          <input
            type="text"
            name="squadName"
            onChange={handleChange}
            value={squads.squadName}
          />
          <button type="submit" hidden />
        </form>
        <div id="content__query">
          {props.searchQuery.length > 0 ? (
            props.searchQuery.map((item, k) => (
              <div
                key={k}
                id="query__result"
                onClick={handleJoinReq}
                name={item.squadName}
              >
                <h3 id="squadName">Squad: {item.squadName}</h3>
                <h3>Members: {item.memberCount}</h3>
              </div>
            ))
          ) : (
            <div id="query__result">
              <h3>Squad Not Found</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  searchQuery: state.Data.squadSearchInfo,
  user: state.User
});

const mapActionsToProps = {
  searchForSquad,
  sendJoinRequest
};

export default connect(mapStateToProps, mapActionsToProps)(SquadSearch);
