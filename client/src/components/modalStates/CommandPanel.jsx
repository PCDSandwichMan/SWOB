import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
// Actions
import {
  getCmdBrdInfo,
  saveSquadChanges,
  getSquad,
  toggleModal,
  handleJoinRequestResponse,
  removeUserFromSquad
} from "../../redux/actions/dataActions";
// Styles
import "../../styles/modals/modalStates/commandPanel.scss";

function CommandPanel(props) {
  const [infoChange, setInfoChange] = useState({
    squadName: "",
    removeMembers: []
  });

  useEffect(() => {
    props.getCmdBrdInfo();
  }, []);

  const handleSaveChanges = async e => {
    const saveChanges = await props.saveSquadChanges(infoChange);
    if (saveChanges) {
      const subCmdPnlRefresh = await props.getSquad();
      const subCmdPnlRefresh1 = await props.getCmdBrdInfo();
      props.toggleModal("");
    }

    // Remove if requested
    if (infoChange.removeMembers.length > 0) {
      props.removeUserFromSquad(infoChange.removeMembers);
    }
  };

  const handleSquadNameChange = e => {
    setInfoChange({
      ...infoChange,
      [e.target.name]: e.target.value
    });
  };

  const handleUserRemove = e => {
    document.getElementById(e.target.id).classList.toggle("marked");
    const index = infoChange.removeMembers.indexOf(e.target.name);
    if (index !== -1) return infoChange.removeMembers.splice(index, 1);
    infoChange.removeMembers.push(e.target.name);
  };

  const handleVerify = async () => {
    const userId = await document.getElementById("logger").value;
    const handleChanges = await props.handleJoinRequestResponse({
      decision: "verify",
      userId: userId
    });
    console.log("running");
    props.getCmdBrdInfo();
  };

  const handleReject = async () => {
    const userId = await document.getElementById("logger").value;
    const handleChanges = await props.handleJoinRequestResponse({
      decision: "reject",
      userId: userId
    });
    console.log("running");
    props.getCmdBrdInfo();
  };

  // console.log(props.pnlInfo.squadStats.avgRank);
  return (
    <div id="command-panel">
      <div className="command-panel__sub top-com">
        <div className="sub__field resize-field">
          <h3>Change Name: </h3>
          <input
            id="sub__name"
            type="text"
            name="squadName"
            onChange={handleSquadNameChange}
            value={infoChange.squadName}
            placeholder={props.squad.squadName}
          />
        </div>
        <div className="sub__field">
          <h3>
            Total XP:{" "}
            {props.pnlInfo.squadStats
              ? props.pnlInfo.squadStats.totalScore
              : null}
          </h3>
        </div>
        <div className="sub__field">
          <h3>
            Avg Rank:{" "}
            {props.pnlInfo.squadStats ? props.pnlInfo.squadStats.avgRank : null}
          </h3>
        </div>
        <div>
          {props.pnlInfo.joinRequest
            ? props.pnlInfo.joinRequest.map((join, key) => (
                <div key={key} id="join-request">
                  <div>
                    <input type="hidden" id="logger" value={join.userId} />
                    <i
                      onClick={handleVerify}
                      id="request-verify"
                      className="fa fa-check"
                    ></i>
                    <i
                      onClick={handleReject}
                      id="request-reject"
                      className="fa fa-times"
                    ></i>
                  </div>
                  <h4 id="requesting-user">{join.username}</h4>
                </div>
              ))
            : null}
        </div>
      </div>
      <div className="command-panel__sub">
        <table id="global__table">
          <thead>
            <tr id="global__header">
              <th>
                <h4>Remove</h4>
              </th>
              <th>
                <h4>SquadStatus</h4>
              </th>
              <th>
                <h4>Username</h4>
              </th>
              <th>
                <h4>Rank</h4>
              </th>
              <th>
                <h4>Win/Loss</h4>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(props.pnlInfo).length > 0
              ? props.pnlInfo.members.map((user, key) => (
                  <tr key={key} className="global__User-container" key={key}>
                    <td>
                      {user.username !== props.user.username ? (
                        <button
                          name={user.memberId}
                          onClick={handleUserRemove}
                          id="cmdPnl-delete"
                        >
                          ✕
                        </button>
                      ) : null}
                    </td>
                    <td>
                      <h3>{user.status}</h3>
                    </td>
                    <td>
                      <h3>{user.username}</h3>
                    </td>
                    <td>
                      <h3>{user.rank}</h3>
                    </td>
                    <td>
                      <h3>{user.rank}</h3>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
      <div onClick={handleSaveChanges} id="com-panel__save">
        <a>Save Changes</a>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  squad: state.User.squad,
  pnlInfo: state.Data.squadMemberInfo,
  user: state.User
});

const mapActionsToProps = {
  getCmdBrdInfo,
  saveSquadChanges,
  getSquad,
  handleJoinRequestResponse,
  toggleModal,
  removeUserFromSquad
};

export default connect(mapStateToProps, mapActionsToProps)(CommandPanel);
