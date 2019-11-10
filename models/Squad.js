const mongoose = require('mongoose');

const SquadSchema = new mongoose.Schema({
  squadName: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
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
  // TODO future implements
  // globalRank: {
  //   type: Number,
  //   required: true,
  //   trim: true
  // },
  // combinedXP: {},
  // combinedWL: {},
  // combinedLosses: {},
  // combinedWins: {}
});

module.exports = mongoose.model('Squads', SquadSchema);
