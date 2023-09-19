const mongoose = require("mongoose");
const { Schema } = mongoose;
const boostSchema = new Schema(
  {
    walletAddress: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      default: "",
    },
    boostId: {
      type: Number,
      unique: true,
    },
    boostAmount: {
      type: Number,
    },
    canClaim: {
      type: Boolean,
      default: false,
    },
    isClaimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = { Boost: mongoose.model("boost", boostSchema) };
