const mongoose = require("mongoose");
module.exports = (function () {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Db connected :>> ");
    });
})();
