import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import "../../styles/dashboard/userCardStyles.scss";
import placeHolderUser from "../../images/yodaPlaceholder.jpg";
import placeHolderRank from "../../images/rankPlaceholder.png";
import { getUserImage } from "../../redux/actions/userActions";

function UserCard(props) {
  const getUserImage = () => {
    // const getImage = await props.getUserImage(props.userData.userCharacter.name);
    return placeHolderUser;
  };

  let [progress, setProgress] = useState({
    currPercentage: 0
  });

  // User level setup
  let totalLvXp, totalLvPercentage;
  useEffect(() => {
    // (500) * (1.1)^n
    if (props.progressData) {
      totalLvXp = 500 * Math.pow(1.1, props.progressData.rank);
      totalLvPercentage = (props.progressData.xp / totalLvXp) * 100;
      setProgress({
        ...progress,
        currPercentage: totalLvPercentage
      });
    }
  }, [props.progressData]);

  return (
    <div id="userCard">
      <header>
        <div id="profilePic-wrapper">
          <div id="profilePic-container">
            <img src={getUserImage()} alt="user profile" />
          </div>
        </div>
        <h1>{props.userData.username ? props.userData.username : null}</h1>
      </header>
      <main>
        <div id="content-container">
          <ul>
            <li style={{ whiteSpace: "nowrap" }}>
              Character:{" "}
              <span>
                {props.userData.userCharacter.name
                  ? props.userData.userCharacter.name
                  : null}
              </span>
            </li>
            <li>
              Type:{" "}
              <span>
                {props.userData.userCharacter.species
                  ? props.userData.userCharacter.species
                  : null}
              </span>
            </li>
            <li>
              Gender:{" "}
              <span>
                {props.userData.userCharacter.gender
                  ? props.userData.userCharacter.gender
                      .charAt(0)
                      .toUpperCase() +
                    props.userData.userCharacter.gender.slice(1)
                  : null}
              </span>
            </li>
            <li>
              Height:{" "}
              <span>
                {props.userData.userCharacter.height
                  ? (
                      Math.ceil(
                        (props.userData.userCharacter.height / 30.48) * 100
                      ) / 100
                    )
                      .toString()
                      .split(".")
                      .join(`' `) + '"'
                  : null}
              </span>
            </li>
            <li>
              Mass:{" "}
              <span>
                {props.userData.userCharacter.mass &&
                props.userData.userCharacter.mass !== "unknown"
                  ? Math.ceil(
                      (props.userData.userCharacter.mass / 0.454) * 100
                    ) /
                      100 +
                    " lbs"
                  : "Unknown"}
              </span>
            </li>
            <li>
              Birth Year:{" "}
              <span>
                {props.userData.userCharacter.birth_year
                  ? props.userData.userCharacter.birth_year
                  : null}
              </span>
            </li>
          </ul>
        </div>
        <div id="rankPic-container">
          <div id="rankPic">
            <img src={placeHolderRank} alt="user rank" />
          </div>
          <h4>
            Level{" "}
            {props.userData.userCharacter.rpgInfo
              ? props.userData.userCharacter.rpgInfo.rank
              : "Recruit"}
          </h4>
          <div id="level-progress">
            {/* Ranking System Guide:
            Per level 0-1 = 500xp;
                per lv past 1 increment xp cap 1.1x 
                
              

                500
                */}
            <div
              style={{ width: `${progress.currPercentage}%` }}
              id="level-progress__bar"
            ></div>
          </div>
        </div>
      </main>
      <footer>
        <div id="footer__kd-container">
          <h4>
            <span style={{ color: "green" }}>Win</span> /{" "}
            <span style={{ color: "red" }}>Loss</span>:{" "}
            {typeof props.userData.userCharacter.stats.totalLosses !=
            "undefined"
              ? Math.round(
                  100 *
                    (props.userData.userCharacter.stats.totalWins /
                      (props.userData.userCharacter.stats.totalLosses === 0
                        ? 1
                        : props.userData.userCharacter.stats.totalLosses))
                ) / 100
              : null}
          </h4>
          <hr />
          <h4>
            Total Wins:{" "}
            <span id="kd__wins">
              {typeof props.userData.userCharacter.stats.totalWins !=
              "undefined"
                ? props.userData.userCharacter.stats.totalWins
                : null}
            </span>
          </h4>
          <h4>
            Total Losses:{" "}
            <span id="kd__losses">
              {typeof props.userData.userCharacter.stats.totalLosses !=
              "undefined"
                ? props.userData.userCharacter.stats.totalLosses
                : null}
            </span>
          </h4>
        </div>
        <div id="footer__streak-container">
          <h4>Win Streak: </h4>
          <hr />
          <h4 id="streak__num">
            {typeof props.userData.userCharacter.stats.winStreak != "undefined"
              ? props.userData.userCharacter.stats.winStreak
              : null}
          </h4>
        </div>
      </footer>
    </div>
  );
}

const mapStateToProps = state => ({
  userData: state.User,
  progressData: state.User.userCharacter.rpgInfo
});

const mapActionsToProps = {
  getUserImage
};

export default connect(mapStateToProps, mapActionsToProps)(UserCard);
