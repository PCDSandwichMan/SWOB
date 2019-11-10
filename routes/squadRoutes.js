const Squad = require('../models/Squad');
const Users = require('../models/User');
const router = require('express').Router();
const extTool = require('../utils/extractTools');
const { schemas, validateBody } = require('../utils/validJoi');
const passport = require('passport');
const passportConfig = require('../utils/passport');

/*
create squad
get squad

update squad info
add squad members
update squad ranks
delete squad ranks
*/

// Create Squad
router.post(
  '/create',
  validateBody(schemas.squadCreation),
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Check for existing squad
      const testSquadExisting = await Squad.findOne({
        squadName: req.body.squadName
      });
      if (testSquadExisting) {
        return res
          .status(400)
          .json({ error: 'this squad name has already been claimed' });
      }
      if (req.user.squad) {
        return res
          .status(400)
          .json({ error: 'squad already assigned to this user' });
      }

      // Saves Squad
      const newSquad = new Squad({
        squadName: req.body.squadName,
        grandAdmiral: req.user.username
      });
      const saveSquad = await newSquad.save();

      // Saves User To Squad
      const addSquadToUser = await Users.findByIdAndUpdate(req.user._id, {
        $set: { squad: saveSquad._id }
      });

      if (!saveSquad || !addSquadToUser) {
        return res.status(500).json({ error: 'unable to save squad to user' });
      }

      res.status(201).json({ squad: 'your squad has been created' });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

// Get Squad By User On Token
router.get(
  '/get',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (!req.user.squad) {
        return res.status(404).json({ squad: 'squad not found for this user' });
      }
      let getUserSquad = await Squad.findOne(req.user.squad);
      if (!getUserSquad) {
        res.status(404).json({ squad: 'squad not found for this user' });
      }

      // TODO testing
      res.status(200).json(getUserSquad);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: 'an error occurred while fetching a squad for this user'
      });
    }
  }
);

// Get users and clan totals for command panel
router.get(
  '/command-panel-info',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    /*
    Demo Res:
    squadStats: {
      totalScore
      avgRank
    }
    members: [
      username: {
        status
        username
        rank
        win/loss
      }
    ]

    { captain: [],
    lieutenantCommander: [],
    grunt: [],
    _id: 5dc4db1fec69b8324962f5bd,
    squadName: 'Viperrr',
    grandAdmiral: 't',
    __v: 0 }
    */

    // Get squad name from token and Get members by querying for squad
    const getSquad = await Squad.findById(req.user.squad);
    if (!getSquad) {
      return res
        .status(404)
        .json({ error: 'no squad info found for this user' });
    }

    // loop through members and keep running total of rank and xp while assigning vals to new array for endpoint
    let ttlScore = 0;
    let avgRank = 0;
    let incAllUsers = 0;
    let allUsers = [];
    for (user in getSquad) {
      if (user === 'grandAdmiral') {
        const getUser = await Users.findOne({ username: getSquad[user] });
        ttlScore += parseInt(getUser.userCharacter.rpgInfo.xp);
        avgRank += parseInt(getUser.userCharacter.rpgInfo.rank);
        incAllUsers += 1;
        allUsers.push({
          status: user,
          username: getUser.username,
          rank: getUser.userCharacter.rpgInfo.rank,
          wL: getUser.userCharacter.stats.winLossRatio
        });
      }
      if (user === 'captain') {
        if (getSquad[user].length > 0) {
          getSquad[user].forEach(async u => {
            const getUser = await Users.findOne({ username: u });
            ttlScore += parseInt(getUser.userCharacter.rpgInfo.xp);
            avgRank += parseInt(getUser.userCharacter.rpgInfo.rank);
            incAllUsers += 1;
            allUsers.push({
              status: user,
              username: getUser.username,
              rank: getUser.userCharacter.rpgInfo.rank,
              wL: getUser.userCharacter.stats.winLossRatio
            });
          });
        }
      }
      if (user === 'lieutenantCommander') {
        if (getSquad[user].length > 0) {
          getSquad[user].forEach(async u => {
            const getUser = await Users.findOne({ username: u });
            ttlScore += parseInt(getUser.userCharacter.rpgInfo.xp);
            avgRank += parseInt(getUser.userCharacter.rpgInfo.rank);
            incAllUsers += 1;
            allUsers.push({
              status: user,
              username: getUser.username,
              rank: getUser.userCharacter.rpgInfo.rank,
              wL: getUser.userCharacter.stats.winLossRatio
            });
          });
        }
      }
      if (user === 'grunt') {
        if (getSquad[user].length > 0) {
          getSquad[user].forEach(async u => {
            const getUser = await Users.findOne({ username: u });
            ttlScore += parseInt(getUser.userCharacter.rpgInfo.xp);
            avgRank += parseInt(getUser.userCharacter.rpgInfo.rank);
            incAllUsers += 1;
            allUsers.push({
              status: user,
              username: getUser.username,
              rank: getUser.userCharacter.rpgInfo.rank,
              wL: getUser.userCharacter.stats.winLossRatio
            });
          });
        }
      }
    }

    res.status(200).json({
      squadStats: {
        totalScore: ttlScore,
        avgRank: avgRank / incAllUsers,
        memberCount: incAllUsers
      },
      members: allUsers
    });
  }
);

// Save changes made to squad on command panel
router.post(
  '/update-squad',
  passport.authenticate('jwt', { session: false }),
  validateBody(schemas.squadUpdates),
  async (req, res) => {
    try {
      const userSquad = await Squad.findById(req.user.squad);
      // - All validation
      if (!userSquad) {
        return res.status(404).json({ squad: 'could not find squad' });
      }
      if (userSquad.grandAdmiral !== req.user.username) {
        return res
          .status(401)
          .json({ squad: 'only the Grand Admiral can update the squad' });
      }
      if (req.body.removeMembers.includes(req.user.username)) {
        return res
          .status(401)
          .json({ squad: 'Grand Admiral cannot be removed from squad' });
      }
      // - Change squad name if needed
      if (
        req.body.squadName !== userSquad.squadName &&
        req.body.squadName.trim() !== ''
      ) {
        // TODO needs validation check for existing name
        const updateSquadName = await Squad.findByIdAndUpdate(userSquad._id, {
          squadName: req.body.squadName
        });
      }
      //  - Remove users if needed and remove squad from user
      if (req.body.removeMembers.length > 0) {
        req.body.removeMembers.forEach(async m => {
          const testRemove1 = await Squad.findByIdAndUpdate(userSquad._id, {
            $pullAll: { captain: m }
          });
          const testRemove2 = await Squad.findByIdAndUpdate(userSquad._id, {
            $pullAll: { lieutenantCommander: m }
          });
          const testRemove3 = await Squad.findByIdAndUpdate(userSquad._id, {
            $pullAll: { grunt: m }
          });

          const removeSquadFromUser = await Users.findOneAndUpdate(
            { username: m },
            { squad: '' }
          );
        });
      }

      const squadResponse = await Squad.findById(userSquad._id);
      res.status(201).json(squadResponse);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  }
);

module.exports = router;
