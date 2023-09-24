require("dotenv").config();
const express = require("express");
const api = require("./src/routes/api");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// for calling db's connection function
require("./config/db");

function exitHandler(options) {
  mongoose.connection.close();
  process.exit();
}

// for ensuring db connection is closed properly and any necessary cleanup is done before the application exits.
process.on("SIGINT", exitHandler.bind(null, { cleanup: true }));

app.set("port", process.env.PORT);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ extended: false, limit: "1gb" }));

var whitelist = ["http://localhost:8000", "http://localhost:3000"];

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      const err = new Error("NOT_AUTHORIZED");
      err.code = 401;
      callback(err);
    }
  },
};

// only allows whitlisted domains
app.use(cors(corsOptions));

// for all registered API routes
app.use("/api/v1", api);

// For non registered route
app.use("/", function (req, res, next) {
  const err = new Error("Route not registered");
  err.code = 404;
  next(err);
});

// error handlers
app.use(require("./src/middlewares/errorHandler"));

app.all("/*", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Request-Headers", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, Authorization, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Headers, x-auth-token, x-l10n-locale, Cache-Control, timeout"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  next();
});

module.exports = app;
