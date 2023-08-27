const express = require("express");
const router = express();

// all api imports folowed by "/ai/v1"
router.use("/user", require('./user.route'));

module.exports = router;