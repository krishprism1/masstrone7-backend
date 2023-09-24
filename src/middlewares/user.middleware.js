const Joi = require("joi");
const { validateRequest } = require("./requestHelpers");
module.exports = (function () {
  this.validateUserData = async (req, res, next) => {
    const schema = Joi.object({
      walletAddress: Joi.string().required(),
      transactionHash: Joi.string().default(""),
      userId: Joi.string().default(""),
      sponsorId: Joi.string().default(""),
    });
    validateRequest(req, res, next, schema);
  };
  return this;
})();
