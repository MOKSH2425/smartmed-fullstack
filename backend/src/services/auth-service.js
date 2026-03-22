const { env } = require("../config/env");
const { createToken } = require("../utils/token");
const { hashPassword, verifyPassword } = require("../utils/password");
const { HttpError } = require("../utils/http-error");
const { UserModel } = require("../models/user-model");
const {
  sanitizeUser,
  normalizeEmail,
  validateEmail,
  createUserRecord,
  getUserByEmail,
  getUserById,
} = require("./user-service");
const { createStarterReportsForUser } = require("./report-service");

const createAuthResponse = (user) => ({
  token: createToken(
    { sub: String(user._id), email: user.email },
    env.tokenSecret,
    env.tokenTtlHours * 60 * 60
  ),
  user: sanitizeUser(user),
});

const signup = async ({ name, email, password }) => {
  const trimmedName = String(name || "").trim();
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");

  if (!trimmedName || trimmedName.length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters long.");
  }

  if (!validateEmail(normalizedEmail)) {
    throw new HttpError(400, "Please provide a valid email address.");
  }

  if (rawPassword.length < 8) {
    throw new HttpError(400, "Password must be at least 8 characters long.");
  }

  const existingUser = await UserModel.findOne({ email: normalizedEmail }).lean();
  if (existingUser) {
    throw new HttpError(409, "An account with this email already exists.");
  }

  const passwordHash = await hashPassword(rawPassword);
  const createdUser = await UserModel.create(
    createUserRecord({
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    })
  );

  await createStarterReportsForUser(createdUser._id);
  return createAuthResponse(createdUser.toObject());
};

const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const rawPassword = String(password || "");

  if (!validateEmail(normalizedEmail)) {
    throw new HttpError(400, "Please provide a valid email address.");
  }

  if (!rawPassword) {
    throw new HttpError(400, "Password is required.");
  }

  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    throw new HttpError(401, "Email or password is incorrect.");
  }

  const passwordMatches = await verifyPassword(rawPassword, user.passwordHash);

  if (!passwordMatches) {
    throw new HttpError(401, "Email or password is incorrect.");
  }

  return createAuthResponse(user);
};

const getCurrentUser = async (userId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new HttpError(404, "Authenticated user was not found.");
  }

  return sanitizeUser(user);
};

module.exports = {
  signup,
  login,
  getCurrentUser,
};
