const { Boost } = require("../models/boost.model");
const { User } = require("../models/user.model");
const { tronWeb } = require("../utils/tron");
const { getAuthToken, decodeAuthToken } = require("../services/auth.service");
const abi = require("../abi.json");
const {
  globalPackageType,
  directIncomeConstant,
  boostConstant,
  teamIncomeConstant,
} = require("../utils/constant");

module.exports = (function () {
  this.firstSignUp = async (req, res, next) => {
    try {
      const {
        walletAddress,
        transactionHash,
        userId,
        sponsorId,
        packageType,
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

      const calcPackageType = +globalPackageType[Number(packageType)];

      const newUser = new User({
        walletAddress: walletAddress,
        transactionHash: transactionHash,
        userId: userId,
        sponsorId: sponsorId,
        packageType: calcPackageType,
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
      const { walletAddress, transactionHash, userId, sponsorId, packageType } =
        req.body;
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

      const calcPackageType = +globalPackageType[Number(packageType)];

      const newUser = new User({
        walletAddress: walletAddress,
        transactionHash: transactionHash,
        userId: userId,
        sponsorId: sponsorId,
        joinedAt: sponsor.joinedAt + 1,
        packageType: calcPackageType,
        pathHistory: path,
        team: [],
      });

      await newUser.save();

      const calcDirectIncome =
        (Number(calcPackageType) * Number(directIncomeConstant["direct"])) /
        100;

      await User.findOneAndUpdate(
        { userId: sponsorId },
        {
          unpaidDirectIncome:
            Number(sponsor.unpaidDirectIncome) + Number(calcDirectIncome),
        }
      );

      let count = 0;
      for (let index = path.length - 1; index >= 0; index--) {
        if (count >= 10) {
          break; // Exit the loop if count is greater than or equal to 10
        }
        const element = path[index];
        const details = await User.findOne({ userId: element });
        let tempTeam = details.team;
        let currentTeamIncome = details.unpaidTeamIncome;
        let calcTeamIncome =
          (Number(calcPackageType) * Number(teamIncomeConstant[count + 1])) /
          100;

        const check = Array.isArray(tempTeam[count]);
        // console.log(check, count, "checkcount");
        if (check) {
          if (count < 10) {
            tempTeam[count].push(String(userId));
            // console.log(tempTeam, `with ${count}`);
            await User.findOneAndUpdate(
              { userId: element },
              {
                unpaidTeamIncome:
                  Number(currentTeamIncome) + Number(calcTeamIncome),
              }
            );
          }
          await User.findOneAndUpdate({ userId: element }, { team: tempTeam });
          count++;
        } else {
          if (count < 10) {
            tempTeam[count] = [String(userId)];
            // console.log(tempTeam, `with ${count}`);
            await User.findOneAndUpdate(
              { userId: element },
              {
                unpaidTeamIncome:
                  Number(currentTeamIncome) + Number(calcTeamIncome),
              }
            );
          }
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
  this.validateRegister = async (req, res, next) => {
    try {
      const { walletAddress, sponsorId } = req.query;
      const user = await User.findOne({
        walletAddress: walletAddress,
      });
      const sponsor = await User.findOne({
        userId: sponsorId,
      });

      const response = {
        status: true,
        message: "",
      };
      if (user) {
        response.status = false;
        response.message = "Already Registerd!";
      } else if (!sponsor) {
        response.status = false;
        response.message = "Invalid SponsorID!";
      }

      if (user) {
        return res.status(400).json(response);
      } else if (!sponsor) {
        return res.status(400).json(response);
      } else {
        return res.status(200).json({
          status: true,
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

      const boostDetails = await Boost.findOne({ walletAddress })
        .sort({
          createdAt: -1,
        })
        .lean();

      return res.status(200).json({
        status: true,
        message: "User details fetched successfully!",
        data: {
          ...details.toJSON(),
          boostAmount: boostDetails?.boostAmount,
        },
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
      // const boostIdThreshold = newDetails.boostId - 3;
      const boostIdThreshold = Math.max(newDetails.boostId - 3, 1);

      let onAmount = 0;
      for (let index = nextBoostId; index >= boostIdThreshold; index--) {
        const element = await Boost.findOne({ boostId: index });
        if (element && element.boostId !== nextBoostId) {
          onAmount = onAmount + element.boostAmount;
          const toDeduct =
            (onAmount * boostConstant.admin) / 100 +
            boostConstant.coinReserve +
            boostConstant.coinBoostingLevel;
          element.cashBackAmount = onAmount - toDeduct;
          await element.save();
        }
      }

      if (nextBoostId >= 4) {
        const updateDetails = await Boost.updateMany(
          { boostId: { $lte: boostIdThreshold }, canClaim: false },
          { $set: { canClaim: true } }
        );
      }

      return res.status(200).json({
        status: true,
        message: "New Boost added successfully!",
        data: {
          newDetails: newDetails.toJSON(),
        },
      });
    } catch (err) {
      next(err);
    }
  };
  this.isBoosted = async (req, res, next) => {
    try {
      const { userId } = req.query;
      const latestItem = await User.findOne({ userId: userId }).sort({
        createdAt: -1,
      });
      if (!latestItem) {
        return res.status(200).json({
          status: true,
        });
      } else if (!latestItem.isClaimed) {
        return res.status(400).json({
          message: "You have an active boosting!",
          status: false,
        });
      } else {
        return res.status(200).json({
          status: true,
        });
      }
    } catch (err) {
      next(err);
    }
  };
  this.getBoost = async (req, res, next) => {
    try {
      const walletAddress = req.params.wallet;
      const details = await Boost.findOne({ walletAddress }).select(
        "walletAddress userId boostId"
      );
      if (!details) {
        return res.status(200).json({
          message: "User does not boosted yet!",
          status: false,
        });
      }

      const unpaidBoostDetails = await Boost.find({
        walletAddress: walletAddress,
        canClaim: true,
        isClaimed: false,
      });

      let unpaidBoostAmount = 0;
      if (unpaidBoostDetails) {
        for (let index = 0; index < unpaidBoostDetails.length; index++) {
          const element = unpaidBoostDetails[index];
          unpaidBoostAmount = unpaidBoostAmount + element.cashBackAmount;
        }
      }

      return res.status(200).json({
        status: true,
        message: "User's boost details fetched successfully!",
        data: {
          ...details.toJSON(),
          unpaidBoostAmount: unpaidBoostAmount,
        },
      });
    } catch (err) {
      next(err);
    }
  };
  this.upgradePackage = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const userDetails = await User.findOne({ userId: userId });
      if (!userDetails) {
        return res.status(400).json({
          message: "User does not exists!",
          status: false,
        });
      }

      function getKeyByValue(object, value) {
        return Object.keys(object).find((key) => object[key] === value);
      }
      const prevPackageKey = getKeyByValue(
        globalPackageType,
        userDetails.packageType
      );
      const calcUpPackageType = +globalPackageType[Number(prevPackageKey) + 1];

      let sponsorDetails;
      if (userDetails.joinedAt !== 0) {
        sponsorDetails = await User.findOne({
          sponsorId: userDetails.sponsorId,
        });
        if (!sponsorDetails) {
          return res.status(400).json({
            message: "Sponsor of this user does not exists!",
            status: false,
          });
        }
      }

      const calcDirectIncome =
        (Number(calcUpPackageType) * Number(directIncomeConstant["direct"])) /
        100;

      if (
        userDetails.joinedAt !== 0 &&
        sponsorDetails.packageType === calcUpPackageType
      ) {
        await User.findOneAndUpdate(
          { userId: userDetails.sponsorId },
          {
            unpaidDirectIncome:
              Number(sponsorDetails.unpaidDirectIncome) +
              Number(calcDirectIncome),
          }
        );
      } else if (
        userDetails.joinedAt !== 0 &&
        sponsorDetails.packageType !== calcUpPackageType
      ) {
        let tempData = { ...sponsorDetails.safeDirectIncome };
        tempData[calcUpPackageType] = Number(calcDirectIncome);

        await User.findOneAndUpdate(
          { userId: userDetails.sponsorId },
          {
            safeDirectIncome: tempData,
          }
        );
      }

      const path = [...userDetails.pathHistory];
      let count = 0;
      for (let index = path.length - 1; index >= 0; index--) {
        if (count >= 10) {
          break; // Exit the loop if count is greater than or equal to 10
        }
        const element = path[index];
        const details = await User.findOne({ userId: element });
        let calcTeamIncome =
          (Number(calcUpPackageType) * Number(teamIncomeConstant[count + 1])) /
          100;
        if (details.packageType === calcUpPackageType) {
          if (count < 10) {
            await User.findOneAndUpdate(
              { userId: element },
              {
                unpaidTeamIncome:
                  Number(details.unpaidTeamIncome) + Number(calcTeamIncome),
              }
            );
          }
          count++;
        } else {
          if (count < 10) {
            let tempData = { ...details.safeTeamIncome };
            tempData[calcUpPackageType] = Number(calcTeamIncome);

            await User.findOneAndUpdate(
              { userId: element },
              {
                safeTeamIncome: tempData,
              }
            );
          }
          count++;
        }
      }

      const safeDirectKeys = Object.keys(userDetails.safeDirectIncome);
      const safeTeamKeys = Object.keys(userDetails.safeTeamIncome);

      if (safeDirectKeys.length) {
        const reqKeys = safeDirectKeys.filter(
          (key) => key <= calcUpPackageType
        );
        if (reqKeys.length) {
          for (let index = 0; index < reqKeys.length; index++) {
            let tempSafeDirectObj = { ...userDetails.safeDirectIncome };
            const element = reqKeys[index];
            const toUpdate = userDetails.safeDirectIncome[element];
            delete tempSafeDirectObj[element];
            await User.findOneAndUpdate(
              { userId: userId },
              {
                unpaidDirectIncome:
                  Number(userDetails.unpaidDirectIncome) + Number(toUpdate),
                safeDirectIncome: tempSafeDirectObj,
              }
            );
          }
        }
      }

      if (safeTeamKeys.length) {
        const reqKeys = safeTeamKeys.filter((key) => key <= calcUpPackageType);
        if (reqKeys.length) {
          for (let index = 0; index < reqKeys.length; index++) {
            let tempSafeTeamObj = { ...userDetails.safeTeamIncome };
            const element = reqKeys[index];
            const toUpdate = userDetails.safeTeamIncome[element];
            delete tempSafeTeamObj[element];
            await User.findOneAndUpdate(
              { userId: userId },
              {
                unpaidTeamIncome:
                  Number(userDetails.unpaidTeamIncome) + Number(toUpdate),
                safeTeamIncome: tempSafeTeamObj,
              }
            );
          }
        }
      }

      const updatedDetails = await User.findOneAndUpdate(
        { userId: userId },
        {
          packageType: calcUpPackageType,
        },
        { new: true }
      );

      return res.status(200).json({
        status: true,
        message: "Package upgraded successfully!",
        data: {
          updatedDetails: updatedDetails.toJSON(),
        },
      });
    } catch (err) {
      next(err);
    }
  };
  return this;
})();
