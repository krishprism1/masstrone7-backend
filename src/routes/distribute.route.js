const express = require("express");
const distributeRoute = express.Router();
const { isAuthenticated } = require("../middlewares/auth.middleware");
const { directIncome, teamIncome, boostIncome } = require("../controllers/distribute.controller");

distributeRoute.get("/directIncome", directIncome);
distributeRoute.get("/teamIncome", teamIncome);
distributeRoute.get("/boostIncome", boostIncome);

module.exports = distributeRoute;
