const Users = require('../models/User');
const Notifications = require('../models/Notification');
const axios = require('axios');
const valTools = require('./validators');

// - Gens a random character from swapi with random character and random return result index (relies on getChar())
exports.getRandCharacter = async () => {
  errors = {};
  const randomQueryCharacter = await this.getChar();
  const characterCall = await axios
    .get(`https://swapi.co/api/people/?search=${randomQueryCharacter}`)
    .then(characters => {
      // get res length for the random
      resLength = characters.data.results.length;
      randChar = characters.data.results[Math.floor(Math.random() * resLength)];
      // TODO for testing delete me
      //   console.log('======= IN HELPER FUNCTIONS ==========');
      //   console.log(resLength);
      //   console.log(randomQueryCharacter);
      //   console.log(randChar.name);
      //   console.log('======= IN HELPER FUNCTIONS =========');
      return randChar;
    })
    .catch(err => {
      console.log(err);
      return {
        error: 'an error occurred while creating your battle'
      };
    });
  return characterCall;
};

// - Used to gen random char for the battle message route when creating a random character (if needed it can gen an ID by allowing length arg and adding a loops)
exports.getChar = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  let charactersLength = characters.length;
  return characters.charAt(Math.round(Math.random() * charactersLength));
};

// - Generates bot stats for bot battle base of user rank ±5
exports.generateBot = userRank => {
  let randRankRange = 0;
  let rankIsGreater = false;
  let botRank = 0;
  let botDef = 0;
  let botAtk = 0;

  if (typeof userRank === 'undefined') {
    console.log('you must include a user rank to generate a bot');
    return {
      error: 'you must include a user rank to generate a bot'
    };
  }

  // Edge Case Checks | if userRank is 0 // if userRank is 1 and it wants to gen -5 |
  if (userRank === 0) {
    return {
      botAtk: 0,
      botDef: 0,
      botRank: 0
    };
  }
  // randomizing logic
  // bot rank increment num  or decrement num
  if (userRank < 5) {
    randRankRange = Math.floor(Math.random() * (userRank + 1));
  } else {
    randRankRange = Math.floor(Math.random() * 6);
  }
  // setting if rank is less thank or greater thank user
  Math.round(Math.random() < 0.5) === 0
    ? (rankIsGreater = false)
    : (rankIsGreater = true);
  // set bot rank
  if (rankIsGreater) {
    botRank = userRank + randRankRange;
  } else {
    botRank = userRank - randRankRange;
  }
  // bot stat delegation
  totalPoints = botRank * 30;
  for (i = totalPoints; i > 0; --i) {
    Math.round(Math.random() * 101) >= 50 ? ++botAtk : ++botDef;
  }
  //   console.log('============ IN HELPER FUNCTIONS BOT STAT GEN ===========');
  //   console.log(botRank);
  //   console.log(botAtk);
  //   console.log(botDef);
  //   console.log('============ IN HELPER FUNCTIONS BOT STAT GEN ===========');
  return {
    botRank: botRank,
    botAtk: botAtk,
    botDef: botDef
  };
};

// - HANDLE ONLINE CHARACTER GEN AND RETURN FOR ONLINE BATTLES
exports.getOnlineUser = async (userRank, userUsername) => {
  if (typeof userRank === 'undefined') {
    return {
      success: false,
      error: 'must include user rank to get online character'
    };
  }
  let randomOnlineUser;
  // get a list of users ±5 rank from the requesting user
  const randomDefender = await Users.find({
    $and: [
      {
        'userCharacter.rpgInfo.rank': {
          $gte: userRank - 5,
          $lte: userRank + 5
        }
      },
      { username: { $ne: userUsername } }
    ]
  });

  //   for ±5 is not applicable for this user then it will default to a random
  const getRandomUser = async () => {
    const userCount = await Users.countDocuments();
    const random = Math.floor(Math.random() * userCount);
    randomOnlineUser = await Users.findOne().skip(random);
    return randomOnlineUser;
  };
  if (randomDefender.length <= 0) {
    randomOnlineUser = await getRandomUser();
    while (randomOnlineUser.username === userUsername) {
      randomOnlineUser = await getRandomUser();
    }
  } else {
    randomOnlineUser =
      randomDefender[Math.floor(Math.random() * randomDefender.length)];
  }
  return {
    success: true,
    randomOnlineUser
  };
};

// - HANDLE XP AND LEVELING AFTER BATTLES AND DEFENDS
exports.handleXp = async (battleResults, attacker, defender = null) => {
  //    Handles if won increment winner and decrement loser
  if (battleResults !== 'won' && battleResults !== 'lost') {
    console.log(
      ' ================== DEFAULT DO NOTHING HANDLER (HELPERS XP HANDLER) ================== '
    );
  }
  //    If won add 20xp to winner else add 20 to defender
  const getAttacker = await Users.findOne({ username: attacker });
  //   If this is a bot it i will be null
  const getDefender = await Users.findOne({ username: defender });

  if (battleResults === 'won') {
    getAttacker.userCharacter.rpgInfo.xp += 20;
    if (getDefender) {
      getDefender.userCharacter.rpgInfo.xp -= 10;
    }
  } else {
    getAttacker.userCharacter.rpgInfo.xp -= 10;
    if (getDefender) {
      getDefender.userCharacter.rpgInfo.xp += 20;
    }
  }

  //   update winner xp after determining xp val and IF THE XP IS 0 OR LOWER IS WILL DEFAULT TO 0
  if (getAttacker.userCharacter.rpgInfo.xp <= 0) {
    const updateWinnerXP = await Users.findByIdAndUpdate(getAttacker._id, {
      $set: { 'userCharacter.rpgInfo.xp': 0 }
    });
  } else {
    const updateWinnerXP = await Users.findByIdAndUpdate(getAttacker._id, {
      $set: { 'userCharacter.rpgInfo.xp': getAttacker.userCharacter.rpgInfo.xp }
    });
  }
  //   update loser xp after determining xp val and check if not bot(shows as null)
  if (getDefender) {
    if (getDefender.userCharacter.rpgInfo.xp <= 0) {
      const updateLoserXP = await Users.findByIdAndUpdate(getDefender._id, {
        $set: {
          'userCharacter.rpgInfo.xp': 0
        }
      });
    } else {
      const updateLoserXP = await Users.findByIdAndUpdate(getDefender._id, {
        $set: {
          'userCharacter.rpgInfo.xp': getDefender.userCharacter.rpgInfo.xp
        }
      });
    }
  }
  //   handles update win and loss ratio
  if (battleResults === 'won') {
    const updateWinnerWL = await Users.findByIdAndUpdate(getAttacker._id, {
      $set: {
        'userCharacter.stats.totalWins':
          getAttacker.userCharacter.stats.totalWins + 1,
        'userCharacter.stats.winStreak':
          getAttacker.userCharacter.stats.winStreak + 1,
        'userCharacter.stats.winLossRatio':
          Math.round(
            100 *
              (getAttacker.userCharacter.stats.totalWins +
                1 /
                  (getAttacker.userCharacter.stats.totalLosses === 0
                    ? 1
                    : getAttacker.userCharacter.stats.totalLosses))
          ) / 100
      }
    });
    if (getDefender) {
      const updateLoserWL = await Users.findByIdAndUpdate(getDefender._id, {
        $set: {
          'userCharacter.stats.totalLosses':
            getDefender.userCharacter.stats.totalLosses + 1,
          'userCharacter.stats.winLossRatio':
            Math.round(
              100 *
                (getDefender.userCharacter.stats.totalWins +
                  1 /
                    (getDefender.userCharacter.stats.totalLosses === 0
                      ? 1
                      : getDefender.userCharacter.stats.totalLosses))
            ) / 100
        }
      });
    }
  } else if (battleResults === 'lost') {
    const updateLoserWL = await Users.findByIdAndUpdate(getAttacker._id, {
      $set: {
        'userCharacter.stats.winStreak': 0,
        'userCharacter.stats.totalLosses':
          getAttacker.userCharacter.stats.totalLosses + 1,
        'userCharacter.stats.winLossRatio':
          Math.round(
            100 *
              (getAttacker.userCharacter.stats.totalWins /
                (getAttacker.userCharacter.stats.totalLosses + 1 === 0
                  ? 1
                  : getAttacker.userCharacter.stats.totalLosses + 1))
          ) / 100
      }
    });
    if (getDefender) {
      const updateWinnerXP = await Users.findByIdAndUpdate(getDefender._id, {
        $set: {
          'userCharacter.stats.totalWins':
            getDefender.userCharacter.stats.totalWins + 1,
          'userCharacter.stats.winLossRatio':
            Math.round(
              100 *
                (getAttacker.userCharacter.stats.totalWins +
                  1 /
                    (getAttacker.userCharacter.stats.totalLosses === 0
                      ? 1
                      : getAttacker.userCharacter.stats.totalLosses))
            ) / 100
        }
      });
    }
  } else {
    console.log(
      '========= BATTLE WAS NOT WON OR LOST (HANDLE XP | HELPER FUNCTIONS) =============='
    );
  }

  //   Now that the XP has been delegated this will check if leveling effects need to take place
  // TODO create notification for either client if the level up
  const checkAttackerForLevel = await Users.findOne({ username: attacker });
  const checkDefenderForLevel = await Users.findOne({ username: defender });
  if (
    checkAttackerForLevel.userCharacter.rpgInfo.xp >=
    checkAttackerForLevel.userCharacter.rpgInfo.rank * 500
  ) {
    const levelUpAttacker = await Users.findByIdAndUpdate(
      checkAttackerForLevel._id,
      {
        $set: {
          'userCharacter.rpgInfo.rank': Math.floor(
            checkAttackerForLevel.userCharacter.rpgInfo.xp / 500
          )
        }
      }
    );
  } else if (
    checkAttackerForLevel.userCharacter.rpgInfo.xp <
    checkAttackerForLevel.userCharacter.rpgInfo.rank * 500
  ) {
    const levelDownAttacker = await Users.findByIdAndUpdate(
      checkAttackerForLevel._id,
      {
        $set: {
          'userCharacter.rpgInfo.rank': Math.floor(
            checkAttackerForLevel.userCharacter.rpgInfo.xp / 500
          )
        }
      }
    );
  }
  if (checkDefenderForLevel) {
    if (
      checkDefenderForLevel.userCharacter.rpgInfo.xp >=
      checkDefenderForLevel.userCharacter.rpgInfo.rank * 500
    ) {
      const levelUpDefender = await Users.findByIdAndUpdate(
        checkDefenderForLevel._id,
        {
          $set: {
            'userCharacter.rpgInfo.rank': Math.floor(
              checkDefenderForLevel.userCharacter.rpgInfo.xp / 500
            )
          }
        }
      );
    } else if (
      checkDefenderForLevel.userCharacter.rpgInfo.xp <
      checkDefenderForLevel.userCharacter.rpgInfo.rank * 500
    ) {
      const levelDownDefender = await Users.findByIdAndUpdate(
        checkDefenderForLevel._id,
        {
          $set: {
            'userCharacter.rpgInfo.rank': Math.floor(
              checkDefenderForLevel.userCharacter.rpgInfo.xp / 500
            )
          }
        }
      );
    }
  }
};

// - Creates battle message for battle controller when attack is finished
exports.createBattleLog = async (
  user,
  xpChange,
  battleStatus,
  receiver,
  battleType = 'online'
) => {
  const message = `${user.username} fought ${receiver.username ||
    receiver.name} and ${battleStatus}`;
  const messageType = 'battle';

  const messageInfoPackage = {
    messageType,
    receiver: receiver.username || receiver.name,
    message,
    battleStatus,
    battleType
  };

  // - validates message info
  const validateMessageInfo = valTools.validateChatMessage(messageInfoPackage);
  if (!validateMessageInfo.valid) {
    return {
      errors: validateMessageInfo.errors,
      success: false
    };
  }

  //   sets receiver for persisting if bot or online user
  let newMessage = new Notifications();
  if (battleType === 'online') {
    newMessage = new Notifications({
      messageType,
      sender: user._id,
      receiver: receiver._id,
      message,
      battleStatus,
      battleStatusXp: xpChange
    });
  } else {
    newMessage = new Notifications({
      messageType,
      sender: user._id,
      botCharacter: receiver.name,
      message,
      battleStatus,
      battleStatusXp: xpChange
    });
  }

  const saveBattleLog = await newMessage.save();
  return {
    success: true,
    savedLog: saveBattleLog
  };
};
