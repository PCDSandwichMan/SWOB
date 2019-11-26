import React, { useState } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
// Custom Styles
import "../styles/loginAndReset/resetStyles.scss";
// Actions
import { reqPasswordReset } from "../redux/actions/dataActions";

function PasswordReset(props) {
  const [credentials, setCredentials] = useState({
    email: ""
  });

  const [alerts, setAlerts] = useState({
    alerts: "",
    color: ""
  });

  const resetHandleChange = e => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleReset = async e => {
    e.preventDefault();
    const sendReset = await props.reqPasswordReset(credentials.email);
    if (sendReset) {
      setAlerts({
        ...alerts,
        alerts: "Reset link sent to email",
        color: "Chartreuse"
      });
      setCredentials({
        ...credentials,
        email: ""
      });
    } else {
      setAlerts({
        ...alerts,
        alerts: "Account not found for this email",
        color: "red"
      });
    }
  };

  return (
    <div id="reset-page">
      <div id="reset__form-container">
        <h1>Password Reset</h1>
        <form onSubmit={handleReset}>
          <input
            onChange={resetHandleChange}
            value={credentials.email}
            type="email"
            name="email"
            placeholder="Email"
          />
          {alerts.alerts ? (
            <h5 style={{ color: alerts.color }} className="flashAlert">
              {alerts.alerts}
            </h5>
          ) : null}
          <button type="submit">Send Reset</button>
        </form>
        <div id="page-selection">
          <Link class="selection__link red-hov" to="/">
            Sign In
          </Link>
          <span>|</span>
          <Link class="selection__link green-hov" to="/create-account">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  errors: state.UI.errors
});

const mapActionsToProps = {
  reqPasswordReset
};

export default connect(mapStateToProps, mapActionsToProps)(PasswordReset);
