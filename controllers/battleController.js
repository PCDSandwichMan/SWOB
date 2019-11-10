/*
TASK LIST ORDER:
   √ create function to taken in the req.body data and export it 
   √ apply it to the route for testing 
    create a validator to validate the req.body for what we need
    grad the token and pull the user id so we can ensure this is the real user
*/

// ! Notes:
// ! we can send the receiver client side because I have to render them for options anyways so we already need the route

const validators = require('../utils/validators');
const helperFuncs = require('../utils/battleHelperFunctions.js');
const Users = require('../models/User');

exports.battleHandler = async req => {
  errors = {};
  // Validate battleData
  const checkReq = await validators.validateBattleData(
    req.body,
    req.headers.authorization ? req.headers.authorization.split(' ')[1] : null
  );
  const tokenUser = checkReq.tokenCheck;
  if (!checkReq.valid) {
    return {
      errors: checkReq.errors,
      success: false
    };
  }

  const { battleType } = req.body;
  const { username } = tokenUser.foundUser;

  const getLiveUserInfo = await Users.findOne({ username: username });
  const { rank } = getLiveUserInfo.userCharacter.rpgInfo;
  const {
    attackMultiplier,
    defenseMultiplier
  } = getLiveUserInfo.userCharacter.stats;

  // BOT ROUTE
  if (battleType === 'bot') {
    //  get stats from token user
    userAtk = attackMultiplier;
    userDef = defenseMultiplier;
    userRank = rank;
    userUsername = username;
    //  gen random bot based off rank
    const characterCall = await helperFuncs.getRandCharacter();
    const genBotStats = await helperFuncs.generateBot(userRank);
    if (genBotStats.error) {
      return {
        success: false
      };
    }

    // handles attack after bot/botStatGen and user info fetched
    let battleResults = 'in progress....';
    userAtk > genBotStats.botDef
      ? (battleResults = 'won')
      : (battleResults = 'lost');

    const handleXPAndLeveling = await helperFuncs.handleXp(
      battleResults,
      username
    );

    // handles saving log for battle of battle
    const xpAmount = battleResults === 'won' ? 20 : 10;
    const generateBattleMessage = await helperFuncs.createBattleLog(
      tokenUser.foundUser,
      xpAmount,
      battleResults,
      characterCall,
      'bot'
    );
    if (!generateBattleMessage.success) {
      console.log(generateBattleMessage);
    }

    return {
      success: true,
      character: characterCall.name,
      attackingUser: username,
      botStats: genBotStats,
      sampleResponse: {
        fighter: username,
        defender: characterCall.name,
        battleResults:
          username + ' ' + battleResults + ' against ' + characterCall.name,
        xp: battleResults === 'won' ? '20' : '-10'
      },
      battleLogMessage: generateBattleMessage
    };
  }

  // ONLINE ROUTE
  if (battleType === 'online') {
    //  Gets stats for attacker from client, token, and call methods above
    userAtk = attackMultiplier;
    userDef = defenseMultiplier;
    userRank = rank;
    userUsername = username;
    // Get random defender within a ±5 rank if available
    const getOnlineDefender = await helperFuncs.getOnlineUser(
      userRank,
      userUsername
    );
    if (!getOnlineDefender.success) {
      console.log(getOnlineDefender);
      return {
        success: false,
        response: {
          error: "could not get random user"
        }
      };
    }

    const defenderChar = getOnlineDefender.randomOnlineUser;
    console.log(defenderChar);
    // handles attack after bot/botStatGen and user info fetched
    let battleResults = 'in progress....';
    userAtk > defenderChar.userCharacter.stats.defenseMultiplier
      ? (battleResults = 'won')
      : (battleResults = 'lost');

    const handleXPAndLeveling = await helperFuncs.handleXp(
      battleResults,
      username,
      getOnlineDefender.randomOnlineUser.username
    );

    // handles saving log for battle of battle
    const xpAmount = battleResults === 'won' ? 20 : 10;
    const generateBattleMessage = await helperFuncs.createBattleLog(
      tokenUser.foundUser,
      xpAmount,
      battleResults,
      defenderChar
    );
    if (!generateBattleMessage.success) {
      console.log(generateBattleMessage.errors);
    }

    // console.log(generateBattleMessage.savedLog);

    // console.log({
    //   defender: defenderChar.username,
    //   attackingUser: username,
    //   Log: generateBattleMessage.savedLog
    // });

    return {
      success: true,
      response: {
        defender: defenderChar.username,
        attackingUser: username,
        Log: generateBattleMessage.savedLog,
        sampleResponse: {
          fighter: username,
          defender: defenderChar.username,
          battleResults:
            username +
            ' ' +
            battleResults +
            ' against ' +
            defenderChar.username,
          xp: battleResults === 'won' ? '20' : '-10'
        }
      }
    };
  }
};
