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
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");
const { validateUserData } = require("../middlewares/user.middleware");

userRoute.post("/first-signup", firstSignUp);
userRoute.post("/signup", [validateUserData, signUp]);
userRoute.post("/login", login);
userRoute.get("/auth-check/:token", authCheck)
userRoute.get("/get-users", [isAuthenticated, allUser]);
userRoute.get("/get-user/:id", [isAuthenticated, getUser]);
userRoute.post("/boost-invest", [isAuthenticated, boostInvest]);

module.exports = userRoute;
