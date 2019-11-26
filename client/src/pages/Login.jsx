import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import '../styles/loginAndReset/loginStyles.scss';
import bgVid from '../images/login-bg.mov';
// - Actions
import { loginUser } from '../redux/actions/dataActions';

function Login(props) {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSignIn = e => {
    e.preventDefault();
    props.loginUser(credentials);
  };

  // - Check if auth is set and routes to dashboard onChange if so
  useEffect(() => {
    if (props.isAuthenticated) {
      props.history.push('/dashboard');
    }
  }, [props.isAuthenticated]);

  const loginHandleChange = event => {
    setCredentials({
      ...credentials,
      [event.target.name]: event.target.value
    });
  };
  
  return (
    <div>
      <div id="bgVideo-wrap">
        <video autoPlay="true" loop="true" src={bgVid}></video>
      </div>
      <div id="video-overlay"></div>
      <div id="login-content">
        <div id="login__form-container">
          <h1>
            Star Wars
            <br />
            Online Battles
          </h1>
          {props.errors.signIn && Object.keys(props.errors).length === 1 ? (
            <h5
              style={{ textTransform: 'capitalize', alignSelf: 'center' }}
              className="flashAlert"
            >
              {props.errors.signIn}
            </h5>
          ) : null}
          <form onSubmit={handleSignIn}>
            <input
              onChange={loginHandleChange}
              value={credentials.email}
              type="email"
              name="email"
              placeholder="Email"
              style={props.errors.email ? { margin: '5px 0 0' } : null}
            />
            {props.errors.email ? (
              <h5 className="flashAlert">{props.errors.email}</h5>
            ) : null}
            <input
              onChange={loginHandleChange}
              value={credentials.password}
              type="password"
              name="password"
              placeholder="Password"
              style={props.errors.password ? { margin: '5px 0 0' } : null}
            />
            {props.errors.password ? (
              <h5 className="flashAlert">{props.errors.password}</h5>
            ) : null}
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div id="page-selection">
          <Link className="selection__link red-hov" to="/password-reset">
            Password Reset
          </Link>
          <span>|</span>
          <Link className="selection__link green-hov" to="/create-account">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  isAuthenticated: state.Data.isAuthenticated,
  errors: state.UI.errors
});

const mapActionsToProps = {
  loginUser
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(Login);
