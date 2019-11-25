const Squad = require("../models/Squad");
const Users = require("../models/User");
const router = require("express").Router();
const { schemas, validateBody } = require("../utils/validJoi");
const passport = require("passport");
const passportConfig = require("../utils/passport");

// Create Squad
router.post(
  "/create",
  validateBody(schemas.squadCreation),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // Check for existing squad
      const testSquadExisting = await Squad.findOne({
        squadName: req.body.squadName
      });
      if (testSquadExisting) {
        return res
          .status(400)
          .json({ error: "this squad name has already been claimed" });
      }
      if (req.user.squad) {
        return res
          .status(400)
          .json({ error: "squad already assigned to this user" });
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
        return res.status(500).json({ error: "unable to save squad to user" });
      }
      return res.status(201).json({ squad: "your squad has been created" });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

// Get Squad By User On Token
router.get(
  "/get",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      if (!req.user.squad) {
        return res.status(404).json({ squad: "squad not found for this user" });
      }
      let getUserSquad = await Squad.findOne(req.user.squad);
      if (!getUserSquad) {
        res.status(404).json({ squad: "squad not found for this user" });
      }

      let grunt = [],
        captain = [],
        lieutenantCommander = [];

      // Adds Names to member info
      grunt = await Promise.all(
        getUserSquad.grunt.map(async user => {
          const getUser = await Users.findById(user);
          return { id: user, username: getUser.username };
        })
      );
      captain = await Promise.all(
        getUserSquad.captain.map(async user => {
          const getUser = await Users.findById(user);
          return { id: user, username: getUser.username };
        })
      );
      lieutenantCommander = await Promise.all(
        getUserSquad.lieutenantCommander.map(async user => {
          const getUser = await Users.findById(user);
          return { id: user, username: getUser.username };
        })
      );

      let response = {
        _id: getUserSquad._id,
        joinRequests: getUserSquad.joinRequests,
        squadName: getUserSquad.squadName,
        grandAdmiral: getUserSquad.grandAdmiral,
        grunt,
        captain,
        lieutenantCommander
      };
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({
        error: "an error occurred while fetching a squad for this user"
      });
    }
  }
);

// Get users and clan totals for command panel
router.get(
  "/command-panel-info",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // Get squad name from token and Get members by querying for squad
    const getSquad = await Squad.findById(req.user.squad);
    if (!getSquad) {
      return res
        .status(404)
        .json({ error: "no squad info found for this user" });
    }

    let ttlScore = 0;
    let avgRank = 0;
    let incAllUsers =
      getSquad.lieutenantCommander.length +
      getSquad.captain.length +
      getSquad.grunt.length +
      1;
    let allUsers = [];
    let joinReqUsers = await Promise.all(
      getSquad.joinRequests.map(async user => {
        const getReqUser = await Users.findById(user.userId);
        return {
          userId: getReqUser._id,
          username: getReqUser.username,
          rank: getReqUser.userCharacter.rpgInfo.rank,
          wL: getReqUser.userCharacter.stats.winLossRatio
        };
      })
    );

    // * All users assignments
    //  - ADMIRAL
    // console.log(getSquad.grandAdmiral);
    ttlScore += parseInt(req.user.userCharacter.rpgInfo.xp);
    avgRank += req.user.userCharacter.rpgInfo.rank;
    allUsers.push({
      status: "Grand Admiral",
      username: req.user.username,
      rank: req.user.userCharacter.rpgInfo.rank,
      wL: req.user.userCharacter.stats.winLossRatio
    });

    //  - LIEUTENANT COMMANDER
    // console.log(getSquad.lieutenantCommander);
    const handleOne = await getSquad.lieutenantCommander.forEach(
      async userId => {
        const getUserInfo = await Users.findById(userId);

        ttlScore += parseInt(getUserInfo.userCharacter.rpgInfo.xp);
        avgRank += getUserInfo.userCharacter.rpgInfo.rank;

        allUsers.push({
          status: "Lieutenant Commander",
          username: getUserInfo.username,
          memberId: getUserInfo._id,
          rank: getUserInfo.userCharacter.rpgInfo.rank,
          wL: getUserInfo.userCharacter.stats.winLossRatio
        });
      }
    );

    //  - CAPTAIN
    // console.log(getSquad.captain);
    const handleTwo = await getSquad.captain.forEach(async userId => {
      const getUserInfo = await Users.findById(userId);

      ttlScore += parseInt(getUserInfo.userCharacter.rpgInfo.xp);
      avgRank += getUserInfo.userCharacter.rpgInfo.rank;

      allUsers.push({
        status: "Captain",
        username: getUserInfo.username,
        memberId: getUserInfo._id,
        rank: getUserInfo.userCharacter.rpgInfo.rank,
        wL: getUserInfo.userCharacter.stats.winLossRatio
      });
    });

    //  - GRUNT
    // console.log(getSquad.grunt);
    if (getSquad.grunt.length > 0) {
      const handleThree = await getSquad.grunt.forEach(async userId => {
        const getUserInfo = await Users.findById(userId);

        ttlScore += parseInt(getUserInfo.userCharacter.rpgInfo.xp);
        avgRank += getUserInfo.userCharacter.rpgInfo.rank;

        allUsers.push({
          status: "Grunt",
          username: getUserInfo.username,
          memberId: getUserInfo._id,
          rank: getUserInfo.userCharacter.rpgInfo.rank,
          wL: getUserInfo.userCharacter.stats.winLossRatio
        });
        if (
          getUserInfo._id.toString() ===
          getSquad.grunt[getSquad.grunt.length - 1]
        ) {
          let demoRes = {
            squadStats: {
              totalScore: ttlScore,
              avgRank: avgRank / incAllUsers,
              memberCount: incAllUsers
            },
            members: allUsers,
            joinRequest: joinReqUsers
          };
          return res.status(200).json(demoRes);
        }
      });
    } else {
      // - response setup
      let demoRes = {
        squadStats: {
          totalScore: ttlScore,
          avgRank: avgRank / incAllUsers,
          memberCount: incAllUsers
        },
        members: allUsers,
        joinRequest: joinReqUsers
      };
      return res.status(200).json(demoRes);
    }
  }
);

// Save changes made to squad on command panel
router.post(
  "/update-squad",
  passport.authenticate("jwt", { session: false }),
  validateBody(schemas.squadUpdates),
  async (req, res) => {
    try {
      const userSquad = await Squad.findById(req.user.squad);
      // - All validation
      if (!userSquad) {
        return res.status(404).json({ squad: "could not find squad" });
      }
      if (userSquad.grandAdmiral !== req.user.username) {
        return res
          .status(401)
          .json({ squad: "only the Grand Admiral can update the squad" });
      }
      if (req.body.removeMembers.includes(req.user.username)) {
        return res
          .status(401)
          .json({ squad: "Grand Admiral cannot be removed from squad" });
      }
      // - Change squad name if needed
      if (
        req.body.squadName !== userSquad.squadName &&
        req.body.squadName.trim() !== ""
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
            { squad: "" }
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

// Search for existing squad to join
router.get(
  "/:squadName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const searchForSquad = await Squad.findOne({
        squadName: { $regex: ".*" + req.params.squadName + ".*", $options: "i" }
      });
      if (searchForSquad) {
        // This is for the count
        const userCount =
          1 +
          searchForSquad.lieutenantCommander.length +
          searchForSquad.grunt.length +
          searchForSquad.grandAdmiral.length;

        return res.status(200).json([
          {
            squadName: searchForSquad.squadName,
            memberCount: userCount
          }
        ]);
      }
      return res
        .status(404)
        .json({ squad: "squad with specified name not found" });
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "an error occurred while try to find your squad" });
    }
  }
);

router.post(
  "/join/request",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    /*
      get squad
      assign req to squad
      on command panel get req and display
    */
    try {
      const getSquad = await Squad.findOne({ squadName: req.body.squadName });
      if (!getSquad) {
        return res.status(404).json({ error: "squad could not be found" });
      }

      const verifyIfRepeat = await getSquad.joinRequests.find(
        e => e.userId.toString() === req.user._id.toString()
      );

      if (verifyIfRepeat) {
        return res.status(400).json({ error: "request to join already made" });
      }

      // // saves if not rejected or repeated
      const userReq = {
        userId: req.user._id
      };
      const saveReq = await Squad.findByIdAndUpdate(getSquad._id, {
        $push: {
          joinRequests: userReq
        }
      });

      return res.status(200).json(getSquad);
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
);

router.post(
  "/handle-request",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { decision, requesterId } = req.body;
    // if reject clear the request
    const decidingSquad = await Squad.findById(req.user.squad);
    if (decision === "reject") {
      const newJoinArr = decidingSquad.joinRequests.filter(
        j => j.userId.toString() !== requesterId.toString()
      );
      const saveNewArr = await Squad.findByIdAndUpdate(req.user.squad, {
        $set: { joinRequests: newJoinArr }
      });
      return res.status(204).json(req.body);
    }
    // if resolve add the user to the squad and add the squad to the user
    if (decision === "verify") {
      const newJoinArr = decidingSquad.joinRequests.filter(
        j => j.userId.toString() !== requesterId.toString()
      );
      const saveNewArr = await Squad.findByIdAndUpdate(req.user.squad, {
        $set: { joinRequests: newJoinArr },
        $push: { grunt: requesterId }
      });
      const getRequester = await Users.findByIdAndUpdate(requesterId, {
        squad: req.user.squad
      });

      return res.status(201).json(saveNewArr);
    }
  }
);

router.post(
  "/delete/members",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { userIds } = req.body;
    const getSquad = await Squad.findById(req.user.squad);
    if (!getSquad) res.status(500).json({ squad: "squad could not be found" });
    if (req.user.username !== getSquad.grandAdmiral) {
      return res
        .status(400)
        .json({ unauthorized: "you are not authorized to make this change" });
    }

    const dbInfo = [];
    const dbInfoIds = [];

    getSquad.grunt.forEach(info => {
      dbInfoIds.push(info);
      dbInfo.push({
        status: "grunt",
        index: getSquad.grunt.indexOf(info),
        id: info
      });
    });

    getSquad.captain.forEach(info => {
      dbInfoIds.push(info);
      dbInfo.push({
        status: "captain",
        index: getSquad.captain.indexOf(info),
        id: info
      });
    });

    getSquad.lieutenantCommander.forEach(info => {
      dbInfoIds.push(info);
      dbInfo.push({
        status: "lieutenantCommander",
        index: getSquad.lieutenantCommander.indexOf(info),
        id: info
      });
    });

    // Enures ids in post body are all in the squad
    userIds.forEach(id => {
      if (!dbInfoIds.includes(id)) {
        throw Error("this member is not apart of this clan");
      }
    });

    // Removes from squad
    dbInfo.forEach(obj => {
      dbInfoIds.forEach(id => {
        if (id === obj.id) {
          let index = getSquad[obj.status].indexOf(id);
          getSquad[obj.status].splice(index, 1);
        }
      });
    });
    await getSquad.save();

    // Removes from user
    dbInfoIds.forEach(async id => {
      const user = await Users.findByIdAndUpdate(id, {
        squad: undefined
      });
    });

    res.status(204).json({ squad: "user had been removed from your squad" });
  }
);

router.get(
  "/squad-information/panel",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let allMembers = [];
    try {
      const squad = await Squad.findById(req.user.squad);
      const getGrandAdmiral = await Users.findOne({
        username: squad.grandAdmiral
      });

      squad.grunt.forEach(member => {
        allMembers.push({
          status: "Grunt",
          id: member
        });
      });
      squad.captain.forEach(member => {
        allMembers.push({
          status: "Captain",
          id: member
        });
      });
      squad.lieutenantCommander.forEach(member => {
        allMembers.push({
          status: "Lieutenant Commander",
          id: member
        });
      });

      allMembers = await Promise.all(
        allMembers.map(async member => {
          const user = await Users.findById(member.id);
          return {
            id: member.id,
            status: member.status,
            username: user.username,
            character: user.userCharacter.characterName,
            rank: user.userCharacter.rpgInfo.rank,
            winLoss: user.userCharacter.stats.winLossRatio
          };
        })
      );
      allMembers.push({
        id: getGrandAdmiral._id,
        status: "Grand Admiral",
        username: getGrandAdmiral.username,
        character: getGrandAdmiral.userCharacter.characterName,
        rank: getGrandAdmiral.userCharacter.rpgInfo.rank,
        winLoss: getGrandAdmiral.userCharacter.stats.winLossRatio
      });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ error: "unable to fetch information for this squad" });
    }
    res.status(200).json(allMembers);
  }
);

module.exports = router;
