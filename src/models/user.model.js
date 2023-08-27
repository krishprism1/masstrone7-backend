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
    sponsorId: {
      type: String,
      default: "",
    },
    userId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { User: mongoose.model("user", userSchema) };
