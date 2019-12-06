import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
// Custom Styles
import "../../styles/dashboard/battleCardStyles.scss";
// Actions
import { levelRefresh } from "../../redux/actions/userActions";
import {
  handleBotBattle,
  getBattleMessages,
  handleOnlineBattle
} from "../../redux/actions/dataActions";

function BattleCard(props) {
  useEffect(() => {
    props.getBattleMessages("battle");
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
    <div id="battleCard">
      <div className="battleCard__container">
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
      {!activeBattle.status ? (
        <div id="battleCard__battleButtons">
          <div className="brk-btn" onClick={handleBotBattle}>
            <a>Bot Battle</a>
          </div>
          <div className="brk-btn" onClick={handleOnlineBattle}>
            <a>Online Battle</a>
          </div>
        </div>
      ) : null}
      {/* // - STATS CONTAINER */}
      <div className="battleCard__container lower">
        <h1>Stats:</h1>
        <div>
          <h3>
            Attack Points -{" "}
            {props.userInfo.userCharacter.stats &&
              props.userInfo.userCharacter.stats.attackMultiplier}
          </h3>
          <h3>
            Defence Points -{" "}
            {props.userInfo.userCharacter.stats &&
              props.userInfo.userCharacter.stats.defenseMultiplier}
          </h3>
        </div>
      </div>
      {/* // - INVENTORY CONTAINER */}
      <div className="battleCard__container lower">
        <h1>Inventory:</h1>
        <div>
          <div id="battleCard__container__statModifier">
            <h3>You have no artifacts...</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  userInfo: state.User,
  battleMessages: state.Data.battleMessages
});

const mapActionsToProps = {
  getBattleMessages,
  handleBotBattle,
  handleOnlineBattle,
  levelRefresh
};

export default connect(mapStateToProps, mapActionsToProps)(BattleCard);
