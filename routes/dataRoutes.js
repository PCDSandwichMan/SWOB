const User = require("../models/User");
const router = require("express").Router();
const jwt = require("jsonwebtoken");
const validators = require("../utils/validators");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const async = require("async");
const { validateBody, schemas } = require("../utils/validJoi");
const passport = require("passport");
const passportConfig = require("../utils/passport");

// Login User User
router.post(
  "/login",
  validateBody(schemas.checkLogin),
  passport.authenticate("local", { session: false }),
  async (req, res) => {
    const getToken = await validators.getToken(req.user);
    const infoResponse = {
      username: req.user.username,
      character: req.user.userCharacter.characterName
    };
    res.status(200).json({ token: getToken, infoResponse });
  }
);

// Password Reset Validate and Assign
router.post("/reset", validateBody(schemas.reqReset), async (req, res) => {
  async.waterfall(
    [
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          let token = buf.toString("hex");
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (err) console.log(err);
          if (!user) {
            console.log("------- USER NOT FOUND ON RESET -------");
            return res.status(404).json({ error: "user not found" });
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1hr
          const newUser = new User(user);
          newUser.save(err => {
            if (err) console.log(err);
          });
          done(err, token, user);
        });
      },
      function(token, user, done) {
        const smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "pcdtestpcd@gmail.com",
            pass: "testpasswordtest"
          }
        });
        const mailOptions = {
          to: user.email,
          from: "pcdtestpcd@gmail.com",
          subject: "Password Reset",
          text: `http://localhost:3000/reset/${token}\n\n` // TODO on production add https and correct rest link
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          console.log("mail sent");
          done(err, "done");
          return res.status(200).json({ reset: "reset verified and sent" });
        });
      }
    ],
    err => {
      if (err) {
        console.log(err);
        return res.status(500).json({ reset: "unable to send password reset" });
      }
    }
  );
});

// Password Reset Page Check Token on View
router.get("/reset/:token", (req, res) => {
  User.findOne(
    {
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    },
    (err, user) => {
      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }
      if (!user) {
        return res.status(404).json({
          valid: false,
          passwordReset: "Password reset token is invalid or has expired."
        });
      }
      return res.status(200).json({ token: req.params.token });
    }
  );
});

// Password Reset if token and user verified
router.post("/reset/:token", validateBody(schemas.postReset), (req, res) => {
  async.waterfall(
    [
      function(done) {
        User.findOne(
          {
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
          },
          (err, user) => {
            if (!user) {
              return res.status(404).json({
                valid: false,
                passwordReset: "Password reset token is invalid or has expired."
              });
            }
            if (req.body.password === req.body.confirmPassword) {
              user.password = req.body.password;
              user.resetPasswordToken = null;
              user.resetPasswordExpires = null;
              const passChange = new User(user);
              passChange.save(err => {
                console.log(err);
                done(err, user);
              });
            } else {
              return res.status(400).json({ error: "Passwords must match" });
            }
          }
        );
      },
      function(user, done) {
        const smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "pcdtestpcd@gmail.com",
            pass: "testpasswordtest"
          }
        });
        const mailOptions = {
          to: user.email,
          from: "pcdtestpcd@gmail.com",
          subject: "Password Change Confirmation",
          text: "Your password has been reset"
        };
        smtpTransport.sendMail(mailOptions, err => {
          if (err) console.log(err);
          return res.status(201).json({
            passwordReset:
              "Your password has been reset. You are now able to login."
          });
          done(err);
        });
      }
    ],
    err => {
      if (err) console.log(err);
      return res
        .status(201)
        .json({ passwordReset: "you password has been successfully reset" });
    }
  );
});

// Get Leader Board
router.get("/leaderboard", async (req, res) => {
  const getTopFive = await User.find({})
    .sort({ "userCharacter.rpgInfo.xp": "desc" })
    .limit(5);

  if (!getTopFive || getTopFive.length <= 0) {
    return res.status(500).json({ error: "top five could not be found" });
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
router.get("/getBattleUsers", async (req, res) => {
  let tokenUser;
  try {
    tokenUser = await jwt.decode(req.headers.authorization.split(" ")[1]);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "token is invalid" });
  }
  if (!tokenUser) {
    return res.status(400).json({ error: "token is invalid" });
  }

  // Tries to find users in the ±5 rank range
  let randomOnlineUser;
  const randomDefender = await User.find({
    $and: [
      {
        "userCharacter.rpgInfo.rank": {
          $gte: tokenUser.user.userCharacter.rpgInfo.rank - 5,
          $lte: tokenUser.user.userCharacter.rpgInfo.rank + 5
        }
      },
      { username: { $ne: tokenUser.user.username } }
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
      randomOnlineUser.username !== tokenUser.user.username
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
