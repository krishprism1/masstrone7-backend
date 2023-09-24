const { Boost } = require("../models/boost.model");
const { User } = require("../models/user.model");
const { tronWeb } = require("../utils/tron");
const { getAuthToken, decodeAuthToken } = require("../services/auth.service");
const abi = require("../abi.json");


module.exports = (function () {
  this.firstSignUp = async (req, res, next) => {
    try {
      const {
        walletAddress,
        transactionHash,
        userId,
        sponsorId,
        joinedAt,
        pathHistory,
        team,
      } = req.body;

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
        userId: userId,
        sponsorId: sponsorId,
        joinedAt: joinedAt,
        pathHistory: pathHistory,
        team: team,
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
  this.signUp = async (req, res, next) => {
    try {
      const { walletAddress, transactionHash, userId, sponsorId } = req.body;
      const sponsor = await User.findOne({ userId: sponsorId });
      tronWeb.setAddress(walletAddress);
      let contractInstance = await tronWeb
        .contract()
        .at(process.env.CONTRACT_ADDR);
      let _user = await contractInstance.users(walletAddress).call();
      if (!_user) {
        return res.status(400).json({
          status: false,
          message: "This User is not registered!",
        });
      }

      if (!sponsor) {
        return res.status(400).json({
          status: false,
          message: "This sponsor does not exists!",
        });
      }

      const user = await User.findOne({
        walletAddress: walletAddress,
      });
      if (user) {
        return res.status(400).json({
          status: false,
          message: "User already exists!",
        });
      }

      const path = sponsor.pathHistory.length
        ? [...sponsor.pathHistory, sponsor.userId]
        : [sponsor.userId];

      const newUser = new User({
        walletAddress: walletAddress,
        transactionHash: transactionHash,
        userId: userId,
        sponsorId: sponsorId,
        joinedAt: sponsor.joinedAt + 1,
        pathHistory: path,
        team: [],
      });

      await newUser.save();
      let count = 0;
      for (let index = path.length - 1; index >= 0; index--) {
        const element = path[index];
        const details = await User.findOne({ userId: element });
        let tempTeam = details.team;

        const check = Array.isArray(tempTeam[count]);
        // console.log(check, count, "checkcount");
        if (check) {
          tempTeam[count].push(String(userId));
          // console.log(tempTeam, `with ${count}`);
          await User.findOneAndUpdate({ userId: element }, { team: tempTeam });
          count++;
        } else {
          tempTeam[count] = [String(userId)];
          // console.log(tempTeam, `with ${count}`);
          await User.findOneAndUpdate({ userId: element }, { team: tempTeam });
          count++;
        }
      }

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
      tronWeb.setAddress(walletAddress);
      let contractInstance = await tronWeb
        .contract()
        .at(process.env.CONTRACT_ADDR);
      let _user = await contractInstance.users(walletAddress).call();
      const user = await User.findOne({
        walletAddress: walletAddress,
        userId: `${parseInt(_user[0]?._hex)}`,
      });
      if (!user) {
        return res.status(400).json({
          message: "Please Register First!",
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
  // this.login = async (req, res, next) => {
  //   try {
  //     const { walletAddress } = req.body;
  //     const user = await User.findOne({
  //       walletAddress: walletAddress,
  //     });
  //     if (!user) {
  //       return res.status(400).json({
  //         message: "Please Register First!",
  //         status: false,
  //       });
  //     }
  //     const token = await getAuthToken({ _id: user._id });
  //     res.header("Authorization", `Bearer ${token}`);

  //     return res.status(200).json({
  //       status: true,
  //       message: "Logged In successfully!",
  //       data: { ...user.toJSON(), token },
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // };
  this.authCheck = async (req, res, next) => {
    try {
      const token = req.params.token;
      const data = await decodeAuthToken(token);
      if (data) {
        return res.status(200).json({
          status: true,
          message: "Token authenticated successfully!",
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "Token not authenticated!",
        });
      }
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
      const walletAddress = req.params.wallet;
      const details = await User.findOne({ walletAddress });
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
  this.boostInvest = async (req, res, next) => {
    try {
      const { userId, boostAmount } = req.body;
      const userDetails = await User.findOne({ userId: userId });
      if (!userDetails) {
        return res.status(400).json({
          message: "User does not exists!",
          status: false,
        });
      }

      const highestBoost = await Boost.findOne().sort({ boostId: -1 });
      const nextBoostId = highestBoost ? highestBoost.boostId + 1 : 1;

      const newBoost = new Boost({
        walletAddress: userDetails.walletAddress,
        userId: userId,
        boostId: nextBoostId,
        boostAmount: boostAmount,
      });

      const newDetails = await newBoost.save();

      const boostIdThreshold = newDetails.boostId - 3;
      const updateDetails = await Boost.updateMany(
        { boostId: { $lte: boostIdThreshold }, canClaim: false },
        { $set: { canClaim: true } }
      );

      return res.status(200).json({
        status: true,
        message: "User details fetched successfully!",
        data: {
          newDetails: newDetails.toJSON(),
          updateDetails: updateDetails,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  return this;
})();
