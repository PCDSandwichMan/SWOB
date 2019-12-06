const User = require("../models/User");
const jwt = require("jsonwebtoken");
const config = require("../utils/config");

// - Validator Helpers
const isEmail = email => {
  if (!email) return false;
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegex)) return true;
  return false;
};

const isEmpty = string => {
  if (!string) return true;
  if (string.trim() === "") return true;
  return false;
};

// - Validators

// ====================== NEW ACCOUNT VALIDATION =====================
exports.validateSignUpData = async data => {
  let errors = {};

  // ~~~ Existing Account Check ~~~
  try {
    const checkUsername = await User.findOne({
      username: data.username
    });
    if (checkUsername) {
      errors.username = "Username has already been claimed";
    }

    const checkEmail = await User.findOne({ email: data.email });
    if (checkEmail) {
      errors.email = "An account already exists with this email";
    }
  } catch (err) {
    console.log(err);
  }

  // ~~~ Info validation ~~~
  // - Username Check
  if (isEmpty(data.username)) errors.username = "Must not be empty";

  // - Email Check
  if (isEmpty(data.email)) errors.email = "Must not be empty";
  if (!isEmail(data.email)) errors.email = "Must use valid email";

  // - Password Check
  if (isEmpty(data.password)) errors.password = "Must not be empty";
  if (data.password !== data.confirmPassword) {
    errors.password = "Passwords must match";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

// ====================== LOGIN VALIDATION =====================
exports.getToken = async user => {
  const token = await jwt.sign({ user }, config.JWT_KEY, {
    expiresIn: "3hr"
  });
  return token;
};

// ====================== USER EDITS VALIDATION =====================
exports.validateEditInfo = async data => {
  let errors = {};
  let newData = {};

  // - Checks for any info given
  if (!data.email && !data.username && !data.characterName) {
    errors.missing = "no information was given for edits";
    return {
      errors,
      valid: Object.keys(errors).length === 0 ? true : false
    };
  }

  // - Validates Email if given
  if (data.email) {
    if (!isEmail(data.email)) errors.email = "please include a valid email";
    newData.email = data.email;
  }

  // - Checks if username is available if given
  if (data.username) {
    const checkUsername = await User.findOne({ username: data.username });
    if (checkUsername) {
      errors.username = "username has already been claimed";
    }
    newData.username = data.username;
  }

  // - Checks for id with new character selection
  if (data.characterName) {
    if (isEmpty(data.characterName)) {
      console.log(
        "=================== MISSING ID WITH CHARACTER NAME FOR EDIT ==============="
      );
      errors.characterChange =
        "not able to change character without valid character name";
    }
    newData.userCharacter = {
      characterName: data.characterName
    };
  }

  return {
    newData,
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

// ================================== VALIDATES NEW MESSAGE INFORMATION ================================
exports.validateChatMessage = data => {
  let errors = {};

  const { messageType, receiver, message, battleStatus } = data;
  // Required
  if (isEmpty(messageType) || !messageType)
    errors.messageType = "messageType format is invalid";
  if ((isEmpty(receiver) || !receiver) && battleType !== "bot")
    errors.receiver = "receiver format is invalid";
  if (isEmpty(message) || !message)
    errors.message = "message format is invalid";

  // Optional
  if (battleStatus && typeof battleStatus !== "string")
    errors.battleStatus = "battleStatus format is invalid";

  return {
    errors,
    valid: Object.keys(errors).length > 0 ? false : true
  };
};

// ================================== VALIDATES CHANGE MESSAGE READ STATUS ================================
exports.validateMessageStatus = data => {
  let errors = {};
  const { messageId, status } = data;
  // Required
  if (isEmpty(messageId) || !messageId)
    errors.messageId = "messageId format is invalid";
  if (isEmpty(status) || !status) errors.status = "status format is invalid";

  return {
    errors,
    valid: Object.keys(errors).length > 0 ? false : true
  };
};

// ================================== VALIDATES BATTLE DATA ================================
exports.validateBattleData = async (data, token) => {
  let errors = {};

  // battle type check
  if (data.battleType !== "bot" && data.battleType !== "online") {
    errors.battleType = "you have not selected a valid battle type";
  }
  if (!data.battleType || isEmpty(data.battleType)) {
    errors.battleType = "you must include a battle type";
  }

  // Sender grab and check from token
  const tokenCheck = jwt.decode(token, config.JWT_KEY);
  if (!tokenCheck) {
    errors.token = errors.token = "token must be valid";
  }
  if (!token || isEmpty(token)) {
    errors.token = "token must be included";
  }

  // receiver check
  // TODO this does not apply until we add something besides random
  // const checkReceiver = await User.findOne({ username: data.receiver });
  // if (!checkReceiver && data.battleType !== 'bot') {
  //   errors.receiver = 'must include a valid receiver id for battle message';
  // }
  // if ((!data.receiver || isEmpty(data.receiver)) && data.battleType !== 'bot') {
  //   errors.receiver = 'a receiver for this message must be included';
  // }

  return {
    errors,
    tokenCheck,
    valid: Object.keys(errors).length > 0 ? false : true
  };
};
