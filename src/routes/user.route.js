const express = require("express");
const userRoute = express.Router();
const {
  signUp,
  login,
  allUser,
  getUser,
  firstSignUp,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middlewares/auth.middleware");

userRoute.post("/first-signup", firstSignUp);
userRoute.post("/signup", signUp);
userRoute.post("/login", login);
userRoute.get("/get-users", [isAuthenticated, allUser]);
userRoute.get("/get-user/:id", [isAuthenticated, getUser]);

module.exports = userRoute;
