import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
// Components
import Navbar from '../components/Navbar';
import UserCard from '../components/dashboard/UserCard';
import BattleCard from '../components/dashboard/BattleCard';
import LeaderBoard from '../components/dashboard/LeaderBoard';
import SquadCard from '../components/dashboard/SquadCard';
// Custom Styles
import '../styles/dashboard/dashboardStyles.scss';
// Actions
import { refreshCharacter } from '../redux/actions/userActions';
import { getSquad } from '../redux/actions/dataActions';

function Dashboard(props) {
  useEffect(() => {
    props.refreshCharacter();
    props.getSquad();
  }, []);



  return (
    <div>
      <Navbar />
      <div id="dashboard__main">
        <div id="dashboard__user">
          <UserCard />
          <BattleCard />
        </div>
        <div id="dashboard__global">
          <LeaderBoard />
          <SquadCard />
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  state
});

const mapActionsToProps = {
  refreshCharacter,
  getSquad
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(Dashboard);
