const { User } = require("../models/user.model");
const { getAuthToken } = require("../services/auth.service");

module.exports = (function () {
  this.signUp = async (req, res, next) => {
    try {
      const { walletAddress, transactionHash, sponsorId, userId } = req.body;
      const user = await User.findOne({
        walletAddress: walletAddress,
      });
      if (user) {
        return res.status(400).json({
          status: false,
          message: "User already exists!",
        });
      }
      const newUser = new User({
        walletAddress: walletAddress,
        transactionHash: transactionHash,
        sponsorId: sponsorId,
        userId: userId,
      });
      await newUser.save();

      return res.status(200).json({
        status: true,
        message: "User registered successfully!",
        data: { ...newUser.toJSON() },
      });
    } catch (err) {
      next(err);
    }
  };
  this.login = async (req, res, next) => {
    try {
      const { walletAddress } = req.body;
      const user = await User.findOne({
        walletAddress: walletAddress,
      });
      if (!user) {
        return res.status(400).json({
          message: "User does not exists!",
          status: false,
        });
      }
      const token = await getAuthToken({ _id: user._id });
      res.header("Authorization", `Bearer ${token}`);

      return res.status(200).json({
        status: true,
        message: "Logged In successfully!",
        data: { ...user.toJSON(), token },
      });
    } catch (err) {
      next(err);
    }
  };
  this.allUser = async (req, res, next) => {
    try {
      const user = await User.find({});
      if (!user) {
        return res.status(400).json({
          message: "No users exists!",
          status: false,
        });
      }

      return res.status(200).json({
        status: true,
        message: "All users fetched successfully!",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  };
  this.getUser = async (req, res, next) => {
    try {
      const userId = req.params.id;
      const details = await User.findOne({ userId });
      if (!details) {
        return res.status(400).json({
          message: "User does not exists!",
          status: false,
        });
      }

      return res.status(200).json({
        status: true,
        message: "User details fetched successfully!",
        data: { ...details.toJSON() },
      });
    } catch (err) {
      next(err);
    }
  };
  return this;
})();
