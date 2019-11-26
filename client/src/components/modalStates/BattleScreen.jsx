import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
// Actions
import { levelRefresh } from "../../redux/actions/userActions";
import {
  getBattleMessages,
  handleBotBattle,
  handleOnlineBattle,
  getPossibleMatchup
} from "../../redux/actions/dataActions";
// Styles
import "../../styles/modals/modalStates/battleScreen.scss";

function BattleScreen(props) {
  useEffect(() => {
    props.getBattleMessages("battle");
    props.getPossibleMatchup();
  }, [props.userInfo]);

  const [activeBattle, setActiveBattle] = useState({
    status: false
  });

  const handleOnlineBattle = async () => {
    setActiveBattle({ ...activeBattle, status: true });
    const processOnlineMatch = await props.handleOnlineBattle();
    if (processOnlineMatch) {
      const updateCard = await props.getBattleMessages("battle");
      setActiveBattle({ ...activeBattle, status: false });
      props.levelRefresh();
    }
  };

  const handleBotBattle = async event => {
    setActiveBattle({ ...activeBattle, status: true });
    const processBattle = await props.handleBotBattle();
    if (processBattle) {
      const updateBoard = await props.getBattleMessages("battle");
      setActiveBattle({ ...activeBattle, status: false });
      props.levelRefresh();
    }
  };

  return (
    <div>
      {/* // - for online battle selection and results */}
      <div id="onlineBattle-modal">
        <div id="onlineBattle__action-container">
          <div className="onlineBattle__contentBox">
            {props.battleMessages.length > 0
              ? props.battleMessages.map((log, key) => (
                  <div key={key}>
                    <h1>{log.message}</h1>
                    <h2>
                      {log.battleStatus === "lost" ? "-" : null}
                      {log.battleStatusXp}xp
                    </h2>
                  </div>
                ))
              : null}
          </div>
          {!activeBattle.status && (
            <section>
              <div
                onClick={handleBotBattle}
                className="onlineBattle-buttons bot"
              >
                <a>Bot Battle</a>
              </div>
              <div
                onClick={handleOnlineBattle}
                className="onlineBattle-buttons online"
              >
                <a>Online Battle</a>
              </div>
            </section>
          )}
          <div className="onlineBattle__contentBox" id="contentBox-lower">
            <p>Inventory:</p>
            <br />
            <p>You have no artifacts...</p>
          </div>
        </div>
        <div id="onlineBattle__global-container">
          {/* // - ============ RIGHT USER OPTIONS ================= */}
          <table id="global__table">
            <thead>
              <tr id="global__header">
                <th>
                  <h4>Username</h4>
                </th>
                <th>
                  <h4>Alias</h4>
                </th>
                <th>
                  <h4>Rank</h4>
                </th>
                <th>
                  <h4>WinStreak</h4>
                </th>
              </tr>
            </thead>
            <tbody>
              {props.users.length > 0
                ? props.users.map((user, key) => (
                    <tr className="global__User-container" key={key}>
                      <td>
                        <h3>{user.username}</h3>
                      </td>
                      <td>
                        <h3>{user.characterName}</h3>
                      </td>
                      <td>
                        <h3>{user.rank}</h3>
                      </td>
                      <td>
                        <h3>{user.winStreak}</h3>
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>

          {/* // - =============================== */}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  userInfo: state.User,
  battleMessages: state.Data.battleMessages,
  users: state.Data.potentialUsers
});

const mapActionsToProps = {
  getBattleMessages,
  handleBotBattle,
  handleOnlineBattle,
  getPossibleMatchup,
  levelRefresh
};

export default connect(mapStateToProps, mapActionsToProps)(BattleScreen);
