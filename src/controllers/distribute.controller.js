const { Boost } = require("../models/boost.model");
const { User } = require("../models/user.model");

module.exports = (function () {
  this.directIncome = async (req, res, next) => {
    try {
      const list = await User.find({ unpaidDirectIncome: { $ne: 0 } }).select(
        "walletAddress unpaidDirectIncome"
      );

      const addresses = list.map((user) => user.walletAddress);
      const directIncomes = list.map((user) => user.unpaidDirectIncome);

      console.log("addresses:", addresses, "directIncomes:", directIncomes);

      // After fund tranfer, need to update the DB fields: unpaidDirectIncome && paidDirectIncome
      return res.status(200).json({
        status: true,
        message: "List of directIncome distribution fetched successfully!",
        data: {
          addresses: addresses,
          directIncomes: directIncomes,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  this.teamIncome = async (req, res, next) => {
    try {
      const list = await User.find({ unpaidTeamIncome: { $ne: 0 } }).select(
        "walletAddress unpaidTeamIncome"
      );

      const addresses = list.map((user) => user.walletAddress);
      const teamIncomes = list.map((user) => user.unpaidTeamIncome);

      console.log("addresses:", addresses, "teamIncomes:", teamIncomes);

      // After fund tranfer, need to update the DB fields: unpaidTeamIncome && paidTeamIncome
      return res.status(200).json({
        status: true,
        message: "List of teamIncome distribution fetched successfully!",
        data: {
          addresses: addresses,
          teamIncomes: teamIncomes,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  this.boostIncome = async (req, res, next) => {
    try {
      const list = await Boost.find({
        canClaim: true,
        isClaimed: false,
        cashBackAmount: { $ne: 0 },
      }).select("walletAddress cashBackAmount boostId userId");

      const addresses = list.map((user) => user.walletAddress);
      const boostIncomes = list.map((user) => user.cashBackAmount);
      const boostIds = list.map((user) => user.boostId);

      console.log(addresses, boostIncomes, boostIds, "ppppp");

      // After fund tranfer, need to update the DB fields: Boost -> isClaimed => true && User -> paidBoostIncome
      return res.status(200).json({
        status: true,
        message: "List of teamIncome distribution fetched successfully!",
        data: {
          addresses: addresses,
          teamIncomes: teamIncomes,
          boostIds: boostIds,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  return this;
})();
