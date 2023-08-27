module.exports = (function () {
  this.validateRequest = async (req, res, next, schema) => {
    const options = {
      abortEarly: true, // include all errors
      allowUnknown: true, // ignore unknown props
      stripUnknown: false, // remove unknown props
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
      return res.status(400).json({ message: error.message, status: false });
    }
    // req.body = value;
    next();
  };
  return this;
})();
