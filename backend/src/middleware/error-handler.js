const { HttpError } = require("../utils/http-error");

const notFoundHandler = (_req, _res, next) => {
  next(new HttpError(404, "The requested endpoint was not found."));
};

const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const response = {
    message: error.message || "Internal server error.",
  };

  if (error.details) {
    response.details = error.details;
  }

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json(response);
};

module.exports = { notFoundHandler, errorHandler };
