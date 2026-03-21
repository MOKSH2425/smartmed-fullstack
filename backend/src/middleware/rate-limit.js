const { HttpError } = require("../utils/http-error");

const createRateLimiter = ({ windowMs, max, message }) => {
  const requests = new Map();

  return (req, _res, next) => {
    const key = req.ip || req.headers["x-forwarded-for"] || "anonymous";
    const now = Date.now();
    const existing = requests.get(key);

    if (!existing || existing.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (existing.count >= max) {
      return next(new HttpError(429, message));
    }

    existing.count += 1;
    requests.set(key, existing);
    return next();
  };
};

module.exports = { createRateLimiter };
