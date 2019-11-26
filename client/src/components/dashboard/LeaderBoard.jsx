import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getLeaderBoardUsers } from "../../redux/actions/dataActions";
import "../../styles/dashboard/leaderBoardStyles.scss";

function LeaderBoard(props) {
  useEffect(() => {
    props.getLeaderBoardUsers();
  }, [props.userXpChange]);

  return (
    <div id="leaderBoard">
      <h2 id="leaderBoard-title">LeaderBoard</h2>
      <table id="leaderboard-container">
        <thead>
          <tr id="leaderboard__header">
            <th></th>
            <th>
              <h4>Rank</h4>
            </th>
            <th>
              <h4>Username</h4>
            </th>
            <th>
              <h4>Score</h4>
            </th>
          </tr>
        </thead>
        <tbody>
          {props.leaderboardUsers.length > 0
            ? props.leaderboardUsers.map((userInfo, key) => (
                <tr className="leaderboard__bodyItem" key={key}>
                  <td>
                    <h3>{userInfo.position}.</h3>
                  </td>
                  <td>
                    <h3>{userInfo.rank}</h3>
                  </td>
                  <td>
                    <h3>{userInfo.username}</h3>
                  </td>
                  <td>
                    <h3>{userInfo.score}</h3>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}

const mapStateToProps = state => ({
  leaderboardUsers: state.Data.leaderboard,
  userXpChange: state.User.rpgInfo ? state.User.rpgInfo.xp : state.User.rpgInfo
});

const mapActionsToProps = {
  getLeaderBoardUsers
};

export default connect(mapStateToProps, mapActionsToProps)(LeaderBoard);
