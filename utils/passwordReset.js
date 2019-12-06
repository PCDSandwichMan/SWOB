const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../models/User");

module.exports = {
  sendReset: async.waterfall([
    function(done) {
      [
        crypto.randomBytes(20, function(err, buf) {
          let token = buf.toString("hex");
          done(err, token);
        })
      ];
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          console.log("------- USER NOT FOUND ON RESET -------");
          return user;
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Data.now() + 3600000; // 1hr

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      const smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.RESET_EMAIL,
          pass: process.env.RESET_PASS
        }
      });
      const mailOptions = {
        to: user.email,
        from: process.env.RESET_EMAIL,
        subject: "Password Reset",
        text: `https://${req.headers.host}/reset/${token}\n\n`
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        HTMLFormControlsCollection.log("mail sent");
        done(err, "done");
      });
    }
  ])
};
