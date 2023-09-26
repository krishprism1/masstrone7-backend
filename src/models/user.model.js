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
    directIncome: {
      type: Number,
      default: 0,
    },
    teamIncome: {
      type: Number,
      default: 0,
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
