const User = require('../models/User');
const router = require('express').Router();
const jwt = require('jsonwebtoken');
const validators = require('../utils/validators');

// Login User User
router.post('/login', async (req, res) => {
  const validateLogin = await validators.validateLoginData(req.body);
  if (!validateLogin.valid) {
    return res.status(400).json(validateLogin.errors);
  }
  res.status(200).json(validateLogin.userResponse);
});

// Password Reset
router.post('/reset', async (req, res) => {
  /*
  check for username and email sent
  check that email is on the users account
  make sure user exists
  send rest
  */
});

// Get Leader Board
router.get('/leaderboard', async (req, res) => {
  const getTopFive = await User.find({})
    .sort({ 'userCharacter.rpgInfo.xp': 'desc' })
    .limit(5);

  if (!getTopFive || getTopFive.length <= 0) {
    return res.status(500).json({ error: 'top five could not be found' });
  }

  // sorts data for response
  const configuredResponse = [];
  getTopFive.forEach((user, position) => {
    configuredResponse.push({
      position: position + 1,
      username: user.username,
      score: user.userCharacter.rpgInfo.xp,
      rank: user.userCharacter.rpgInfo.rank
    });
  });

  res.status(200).json(configuredResponse);
});

// Get Users For Online Battle
router.get('/getBattleUsers', async (req, res) => {
  let tokenUser;
  try {
    tokenUser = await jwt.decode(req.headers.authorization.split(' ')[1]);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'token is invalid' });
  }
  if (!tokenUser) {
    return res.status(400).json({ error: 'token is invalid' });
  }
  // console.log(tokenUser.foundUser);

  // Tries to find users in the ±5 rank range
  let randomOnlineUser;
  const randomDefender = await User.find({
    $and: [
      {
        'userCharacter.rpgInfo.rank': {
          $gte: tokenUser.foundUser.userCharacter.rpgInfo.rank - 5,
          $lte: tokenUser.foundUser.userCharacter.rpgInfo.rank + 5
        }
      },
      { username: { $ne: tokenUser.foundUser.username } }
    ]
  });

  // if enough cannot be found it just fills with randoms
  const randomUsers = [];
  const nameCheck = [];
  const getRandomUser = async () => {
    const userCount = await User.countDocuments();
    const random = Math.floor(Math.random() * userCount);
    randomOnlineUser = await User.findOne().skip(random);
    if (
      !nameCheck.includes(randomOnlineUser.username) &&
      randomOnlineUser.username !== tokenUser.foundUser.username
    ) {
      randomUsers.push(randomOnlineUser);
      nameCheck.push(randomOnlineUser.username);
    }
    return randomOnlineUser;
  };
  if (randomDefender.length <= 0) {
    randomOnlineUser = await getRandomUser();
    while (randomUsers.length < 10) {
      randomOnlineUser = await getRandomUser();
    }
    randomOnlineUser = randomUsers;
  } else {
    randomOnlineUser = randomDefender;
    // ? if you want 1 random user from the range uncomment below and add to variable assignment
    // [Math.floor(Math.random() * randomDefender.length)];
  }

  // simplifies data for response
  const prepResponse = randomOnlineUser.map(user => {
    return {
      username: user.username,
      rank: user.userCharacter.rpgInfo.rank,
      characterName: user.userCharacter.characterName,
      winStreak: user.userCharacter.stats.winStreak
    };
  });
  res.status(200).json(prepResponse);
});

module.exports = router;
