import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
// Custom Styles
import "../styles/loginAndReset/resetStyles.scss";
// Actions
import {
  checkResetToken,
  postPasswordReset
} from "../redux/actions/dataActions";

function PasswordChanges(props) {
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: ""
  });

  const [alerts, setAlerts] = useState({
    alerts: "",
    color: "",
    valid: false
  });

  const onChangePasswords = e => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value
    });
  };

  //   - Handles the password change
  const handleSubmitReset = async e => {
    e.preventDefault();
    const handleReset = await props.postPasswordReset(
      passwords,
      props.match.params.token
    );
    if (!handleReset) {
      setAlerts({
        ...alerts,
        alerts: "Passwords must match"
      });
    } else {
      window.location.href = "/";
    }
  };

  //   - Handles verifying the token on load
  useEffect(async () => {
    const testToken = await props.checkResetToken(props.match.params.token);
    if (!testToken) window.location.href = "/password-reset";
    setAlerts({
      ...alerts,
      valid: true
    });
  }, []);
  
  return (
    <div id="reset-page" className="passwordChange-page">
      {alerts.valid ? (
        <div id="reset__form-container">
          <h1>Password Reset</h1>
          <form onSubmit={handleSubmitReset}>
            <input
              onChange={onChangePasswords}
              value={passwords.password}
              type="password"
              name="password"
              placeholder="New Password"
              // required
            />
            <input
              onChange={onChangePasswords}
              value={passwords.confirmPassword}
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              // required
            />
            {alerts.alerts ? (
              <h5 style={{ color: alerts.color }} className="flashAlert">
                {alerts.alerts}
              </h5>
            ) : null}
            <button type="submit">Submit Change</button>
          </form>
          <div id="page-selection">
            <Link className="selection__link red-hov" to="/">
              Sign In
            </Link>
            <span>|</span>
            <Link className="selection__link green-hov" to="/create-account">
              Create Account
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const mapStateToProps = state => ({
  errors: state.UI.errors
});

const mapActionsToProps = {
  checkResetToken,
  postPasswordReset
};

export default connect(mapStateToProps, mapActionsToProps)(PasswordChanges);
