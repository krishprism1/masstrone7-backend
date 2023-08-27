const { STATUS_CODES } = require("http");

const errorHandler = (err, req, res, next) => {
  // Determine the status code based on the error or default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500;
  // Construct an error response
  const errorResponse = {
    status: false,
    message: err.message || STATUS_CODES[statusCode] || "Internal Server Error",
  };
  console.error(err);
  // Send the error response with the determined status code
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
