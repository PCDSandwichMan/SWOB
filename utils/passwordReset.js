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
        text: `
        Hi,

        You recently requested to reset your password for your Star Wars Online Battles Account. Use the link below to reset it. This password reset is only valid for 1 hour(s).

        https://${req.headers.host}/reset/${token}
        
        If you did not request a password reset, please ignore this email or contact matthew.endicott.dev@gmail.com if you have questions.
        
        Thank you,
        The SWOB Team
        `
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        HTMLFormControlsCollection.log("mail sent");
        done(err, "done");
      });
    }
  ])
};
