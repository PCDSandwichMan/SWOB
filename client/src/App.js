import React from "react";
import "./styles/mainFiles/App.scss";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

// Pages and Components
import Login from "./pages/Login";
import PasswordReset from "./pages/PasswordReset";
import NewAccount from "./pages/NewAccount";
import Dashboard from "./pages/Dashboard";
import GeneralModal from "./components/GeneralModal";
import { connect } from "react-redux";

import axios from "axios";
import jwtDecode from "jwt-decode";

import { toggleModal } from "./redux/actions/dataActions";
import PasswordChanges from "./pages/PasswordChanges";

// - Logs out user and clears token on expiration
const { token } = localStorage;
if (token) {
  const decodeToken = jwtDecode(token);
  if (decodeToken.exp * 1000 < Date.now()) {
    console.log("Token is expired");
    localStorage.clear();
    window.location.href = "/";
  }
  axios.defaults.headers.common["Authorization"] = token;
} else if (window.location.pathname === "/dashboard") {
  window.location.href = "/";
}

function App(props) {
  return (
    <div className="App">
      {props.modalStatus ? <GeneralModal /> : null}
      <Router>
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/password-reset" component={PasswordReset} />
          <Route path="/create-account" component={NewAccount} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/reset/:token" component={PasswordChanges} />
        </Switch>
      </Router>
    </div>
  );
}

const mapStateToProps = state => ({
  modalStatus: state.UI.modalStatus
});

export default connect(mapStateToProps, null)(App);
