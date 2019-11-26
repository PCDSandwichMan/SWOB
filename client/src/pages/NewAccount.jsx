import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from 'axios';
// Custom Styles
import '../styles/loginAndReset/newAccountStyles.scss';
// Actions
import { createUser } from '../redux/actions/dataActions';

function NewAccount(props) {
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    characterSelection: ''
  });

  const [charSuggestions, setCharSuggestions] = useState({
    nameSuggestions: [],
    nameSuggestionsLowerCase: []
  });

  const newAccountChange = e => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'characterSelection') {
      newAccountCharacterSelect(e.target.value);
    }
  };

  const handleAccountCreation = e => {
    e.preventDefault();
    userInfo.characterSelection = document.getElementById(
      'userCharacterSelectionInput'
    ).value;
    if (
      charSuggestions.nameSuggestionsLowerCase.includes(
        userInfo.characterSelection.toLowerCase()
      )
    ) {
      props.createUser(userInfo);
    } else {
      alert('Invalid Character Choice');
    }
  };

  // - Handle ajax for character selection
  const newAccountCharacterSelect = userQuery => {
    axios
      .get(`https://swapi.co/api/people/?search=${userQuery}`)
      .then(searchResult => {
        setCharSuggestions({
          ...charSuggestions,
          nameSuggestions: searchResult.data.results.map(
            character => character.name
          ),
          nameSuggestionsLowerCase: searchResult.data.results.map(character =>
            character.name.toLowerCase()
          )
        });
      })
      .catch(err => console.log(err));
  };

  // - Logs in user after profile is created
  useEffect(() => {
    if (props.username.trim() !== '') {
      props.history.push('/dashboard');
    }
  }, [props.username]);

  return (
    <div id="newAccount-page">
      <div id="newAccount__form-container">
        <h1>New Account</h1>
        <form onSubmit={handleAccountCreation}>
          <input
            onChange={newAccountChange}
            value={userInfo.username}
            type="username"
            name="username"
            placeholder="Username"
          />
          {props.errors.username ? (
            <h5 className="flashAlert">{props.errors.username}</h5>
          ) : null}
          <input
            onChange={newAccountChange}
            value={userInfo.email}
            type="email"
            name="email"
            placeholder="Email"
          />
          {props.errors.email ? (
            <h5 className="flashAlert">{props.errors.email}</h5>
          ) : null}
          <input
            onChange={newAccountChange}
            value={userInfo.password}
            type="password"
            name="password"
            placeholder="Password"
          />
          {props.errors.password ? (
            <h5 className="flashAlert">{props.errors.password}</h5>
          ) : null}
          <input
            onChange={newAccountChange}
            value={userInfo.confirmPassword}
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
          />
          {props.errors.confirmPassword ? (
            <h5 className="flashAlert">{props.errors.confirmPassword}</h5>
          ) : null}
          <input
            // onChange={newAccountCharacterSelect}
            onChange={newAccountChange}
            type="text"
            id="userCharacterSelectionInput"
            autoComplete="off"
            name="characterSelection"
            placeholder="Choose Your Character"
          />
          {props.errors.characterSelection ? (
            <h5 className="flashAlert">{props.errors.characterSelection}</h5>
          ) : null}

          {/* // - Only displays button if input is valid (normalized) */}
          {charSuggestions.nameSuggestionsLowerCase.includes(
            userInfo.characterSelection.toLowerCase()
          ) ? (
            <button type="submit">Create Account</button>
          ) : (
            <h2 id="invalidCharacter">Select Valid Character</h2>
          )}

          <div className="characterSuggestions__text">
            <h5 id="characterSuggestions">Name Suggestions: </h5>
            {charSuggestions.nameSuggestions.length > 0
              ? charSuggestions.nameSuggestions
                  .slice(0, 5)
                  .map((name, i) => <h6 key={i}>{name}</h6>)
              : null}
          </div>
        </form>
        <div id="page-selection">
          <Link className="selection__link red-hov" to="/">
            Sign In
          </Link>
          <span>|</span>
          <Link className="selection__link green-hov" to="/password-reset">
            Password Reset
          </Link>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = state => ({
  username: state.User.username,
  errors: state.UI.errors
});

const mapActionsToProps = {
  createUser
};

export default connect(
  mapStateToProps,
  mapActionsToProps
)(NewAccount);
