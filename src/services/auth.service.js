const jwt = require("jsonwebtoken");

/* 
module for auth related services
*/
module.exports = (function () {
  /* generate JWT auth token */
  this.getAuthToken = async (data) => {
    return jwt.sign(data, process.env.SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };
  /* decode JWT auth token */
  this.decodeAuthToken = async (token) => {
    return new Promise((res, rej) => {
      try {
        const data = jwt.verify(token, process.env.SECRET);
        res(data);
      } catch (err) {
        rej(err);
      }
    });
  };
  return this;
})();
