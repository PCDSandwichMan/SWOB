const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    squad: {
      type: mongoose.Schema.Types.ObjectId
    },
    userCharacter: {
      characterName: {
        type: String,
        default: 'Jar Jar Binks'
      },
      rpgInfo: {
        rank: {
          type: Number,
          default: 0
        },
        xp: {
          type: Number,
          default: 0
        },
        squad: {
          squadAlias: {
            type: String,
            trim: true
          },
          squadId: {
            type: mongoose.Schema.Types.ObjectId,
            trim: true
          }
        }
      },
      stats: {
        attackMultiplier: {
          type: Number,
          default: 10
        },
        defenseMultiplier: {
          type: Number,
          default: 5
        },
        winLossRatio: {
          type: Number,
          default: 0.0
        },
        totalWins: {
          type: Number,
          default: 0
        },
        winStreak: {
          type: Number,
          default: 0
        },
        totalLosses: {
          type: Number,
          default: 0
        }
      }
    }
  },
  {
    autoIndex: true,
    timestamps: true
  }
);

UserSchema.pre('save', function(next) {
  let user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(this.password, salt, (hashError, hash) => {
        if (hashError) {
          return next(hashError);
        }
        user.password = hash;
        next();
      });
    });
  }
});

UserSchema.methods.comparePasswords = function(password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

module.exports = mongoose.model('Users', UserSchema);
