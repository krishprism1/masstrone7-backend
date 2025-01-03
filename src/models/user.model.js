const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
    },
    transactionHash: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: "",
    },
    sponsorId: {
      type: String,
      default: "",
    },
    packageType: {
      type: Number,
      default: 1,
    },
    unpaidDirectIncome: {
      type: Number,
      default: 0,
    },
    unpaidTeamIncome: {
      type: Number,
      default: 0,
    },
    paidDirectIncome: {
      type: Number,
      default: 0,
    },
    paidTeamIncome: {
      type: Number,
      default: 0,
    },
    paidBoostIncome: {
      type: Number,
      default: 0,
    },
    safeDirectIncome: {
      type: Object,
      default: {
        0: 0,
      },
    },
    safeTeamIncome: {
      type: Object,
      default: {
        0: 0,
      },
    },
    joinedAt: Number,
    pathHistory: [String],
    team: [],
  },
  {
    timestamps: true,
  }
);

module.exports = { User: mongoose.model("user", userSchema) };
