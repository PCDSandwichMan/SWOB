const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    messageType: {
      type: String,
      enum: ['battle', 'general', 'chat'],
      required: true
    },
    // TODO create a stock "GalacticCommander" account and set his ID as default for sender for general messages/bot battle
    sender: {
      type: mongoose.Types.ObjectId,
      required: true,
      trim: true
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      trim: true
    },
    botCharacter: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    readStatus: {
      type: Boolean,
      default: false
    },
    battleStatus: {
      type: String,
      enum: ['active', 'complete', 'won', 'lost']
    },
    battleStatusXp: {
      type: String,
      trim: true
    }
  },
  {
    autoIndex: true,
    timestamps: true
  }
);

module.exports = mongoose.model('Notifications', NotificationSchema);
