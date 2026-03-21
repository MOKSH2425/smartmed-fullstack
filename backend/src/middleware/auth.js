const { env } = require("../config/env");
const { verifyToken } = require("../utils/token");
const { HttpError } = require("../utils/http-error");

const requireAuth = (req, _res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authorization token is required."));
  }

  const token = header.slice("Bearer ".length);

  try {
    const payload = verifyToken(token, env.tokenSecret);
    req.auth = payload;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { requireAuth };
