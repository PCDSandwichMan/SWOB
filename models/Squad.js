const mongoose = require("mongoose");

const SquadSchema = new mongoose.Schema({
  squadName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  joinRequests: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      isVerified: {
        type: Boolean,
        required: true,
        default: false
      }
    }
  ],
  grandAdmiral: {
    type: String,
    required: true
  },
  captain: [
    {
      type: String
    }
  ],
  lieutenantCommander: [
    {
      type: String
    }
  ],
  grunt: [
    {
      type: String
    }
  ]
});

module.exports = mongoose.model("Squads", SquadSchema);
