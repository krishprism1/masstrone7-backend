const express = require("express");
const userRoute = express.Router();
const {
  signUp,
  login,
  allUser,
  getUser,
  firstSignUp,
  boostInvest,
  authCheck,
  validateRegister,
  isBoosted,
  upgradePackage,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const { validateUserData } = require("../middlewares/user.middleware");

userRoute.post("/first-signup", firstSignUp);
userRoute.post("/signup", [validateUserData, signUp]);
userRoute.post("/login", login);
userRoute.post("/validate-register", validateRegister);
userRoute.get("/auth-check/:token", authCheck);
userRoute.get("/get-users", [isAuthenticated, allUser]);
userRoute.get("/get-user/:wallet", [isAuthenticated, getUser]);
userRoute.post("/boost-invest", [isAuthenticated, boostInvest]);
userRoute.get("/is-boost", [isAuthenticated, isBoosted]);
userRoute.post("/upgrade-package", [isAuthenticated, upgradePackage]);

module.exports = userRoute;
