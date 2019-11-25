const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = require("express").Router();
const User = require("../models/User");
const validators = require("../utils/validators");
const config = require("../utils/config");

// - new user creation
router.post("/new", async (req, res) => {
  // checks for existing email-username // validates info
  const validateInfo = await validators.validateSignUpData(req.body);
  if (!validateInfo.valid) {
    return res.status(400).json(validateInfo.errors);
  }
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    userCharacter: {
      characterName: req.body.characterSelection,
      characterId: req.body.characterId
    }
  });

  newUser.save(async (err, createdUser) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        userCreation: "an error occurred while trying to save you user"
      });
    }
    const token = await jwt.sign({ createdUser }, config.JWT_KEY, {
      expiresIn: "3hr"
    });
    let formatedUser = createdUser;
    formatedUser.password = "";
    return res.status(201).json({ newUser: formatedUser, token: token });
  });
});

// - user edits to account and character
router.post(
  "/edit",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // TODO send character id client side when the user select a character from SWAPI call
    const validateEdits = await validators.validateEditInfo(req.body);
    if (!validateEdits.valid) {
      return res.status(400).json(validateEdits.errors);
    }
    // - User fetch from token to prevent false calls (passport checks valid token)
    const jwtToken = req.headers.authorization.split(" ")[1];
    const jwtUser = jwt.decode(jwtToken);

    // ! working on it
    // const updateUser = await User.findByIdAndUpdate(jwtUser.foundUser._id, {
    //   $set: validateEdits.newData.
    // });
    return res.status(201).json({ edit: "edits have been applied" });
  }
);

// Sends user data after auth token has been assigned
// - WE ARE TRYING TO GET ALL USER DATA TO SEND TO THE USER
router.get("/dashboard-data", async (req, res) => {
  // confirm user by username on token
  let tokenEncoded, token, userId;
  try {
    tokenEncoded = req.headers.authorization.split(" ")[1];
    token = jwt.decode(tokenEncoded, config.JWT_KEY);

    if (!token) {
      return res
        .status(200)
        .json({ error: "token could be verified or was not included" });
    }
    // after verifying the token the user is fetch and sent
    userId =
      typeof token.createdUser === "undefined"
        ? token.foundUser._id
        : token.createdUser._id;
    User.findById(userId, (err, foundUser) => {
      if (err || !foundUser) {
        err && console.log(err);
        console.log(foundUser);
        return res
          .status(404)
          .json({ fetchUserData: "unable to refresh user data" });
      }
      let returnUser = foundUser;
      returnUser.password = null;
      returnUser._id = null;
      returnUser.createdAt = null;
      returnUser.updatedAt = null; 
      return res.status(200).json({ allUserInfo: returnUser });
    });
  } catch (err) {
    console.log(err);
    res
      .status(401)
      .json({ error: "token could be verified or was not included" });
  }
});

router.get(
  "/level",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    res
      .status(200)
      .json({
        rank: req.user.userCharacter.rpgInfo.rank,
        xp: req.user.userCharacter.rpgInfo.xp
      });
  }
);

module.exports = router;
