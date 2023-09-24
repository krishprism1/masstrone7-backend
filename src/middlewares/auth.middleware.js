const { decodeAuthToken } = require("../services/auth.service");

module.exports = (function () {
  this.isAuthenticated = async (req, res, next) => {
    try {
      // Get the Authorization header
      const authHeader = req.headers && req.headers["authorization"];
      if (!authHeader) {
        const err = new Error("ACCESS_DENIED");
        next(err);
      } else {
        // Split the header value to get the token part (Bearer [token])
        const tokenParts = authHeader.split(" ");

        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {

          const err = new Error("ACCESS_DENIED");
          next(err);
        } else {
          const token = tokenParts[1];
          const data = await decodeAuthToken(token);
          if (data) {
            // Token is valid, proceed with the request
            next();
          } else {
            const err = new Error("ACCESS_DENIED");
            next(err);
          }
        }
      }
    } catch (err) {
      next(err);
    }
  };
  return this;
})();
