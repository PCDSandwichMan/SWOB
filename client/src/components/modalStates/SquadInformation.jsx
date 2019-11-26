import React, { useEffect } from "react";
// Styles
import "../../styles/modals/modalStates/squadInformation.scss";
// Actions
import { squadInformationPanel } from "../../redux/actions/dataActions";
// Redux
import { connect } from "react-redux";

function SquadInformation(props) {
  useEffect(() => {
    props.squadInformationPanel();
  }, []);

  return (
    <div id="squadInfo">
      <h1>SquadInformation</h1>
      <div>
        <table id="global__table">
          <thead>
            <tr id="global__header">
              <th>
                <h4>Name</h4>
              </th>
              <th>
                <h4>Level</h4>
              </th>
              <th>
                <h4>Win/Loss</h4>
              </th>
              <th>
                <h4>Character</h4>
              </th>
              <th>
                <h4>Squad Status</h4>
              </th>
            </tr>
          </thead>
          <tbody>
            {props.squadInfo.length > 0
              ? props.squadInfo.map((user, key) => (
                  <tr className="global__User-container" key={key}>
                    <td>
                      <h3>{user.username}</h3>
                    </td>
                    <td>
                      <h3>{user.rank}</h3>
                    </td>
                    <td>
                      <h3>{user.winLoss}</h3>
                    </td>
                    <td>
                      <h3>{user.character}</h3>
                    </td>
                    <td>
                      <h3>{user.status}</h3>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  squadInfo: state.Data.squadInformationPanel
});

const mapActionsToProps = {
  squadInformationPanel
};

export default connect(mapStateToProps, mapActionsToProps)(SquadInformation);
