const { HttpError } = require("../utils/http-error");
const { UserModel } = require("../models/user-model");

const allowedGenders = ["Male", "Female", "Other", "Prefer not to say"];

const defaultSettings = () => ({
  notifications: {
    email: true,
    sms: false,
    promos: true,
  },
  security: {
    twoFactorAuth: false,
    publicProfile: false,
  },
});

const sanitizeUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  age: user.age ?? "",
  gender: user.gender || "Prefer not to say",
  bloodGroup: user.bloodGroup || "",
  address: user.address || "",
  settings: user.settings || defaultSettings(),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

const createUserRecord = ({ name, email, passwordHash, profile = {} }) => ({
  name: String(name).trim(),
  email: normalizeEmail(email),
  passwordHash,
  phone: profile.phone || "",
  age: profile.age ?? null,
  gender: profile.gender || "Prefer not to say",
  bloodGroup: profile.bloodGroup || "",
  address: profile.address || "",
  settings: defaultSettings(),
});

const getUserById = async (userId) => UserModel.findById(userId).lean();

const getUserByEmail = async (email) =>
  UserModel.findOne({ email: normalizeEmail(email) }).lean();

const assertValidProfile = (input) => {
  const name = String(input.name || "").trim();
  const phone = String(input.phone || "").trim();
  const address = String(input.address || "").trim();
  const bloodGroup = String(input.bloodGroup || "").trim();
  const gender = String(input.gender || "Prefer not to say").trim();
  const ageValue = input.age === "" || input.age === null ? null : Number(input.age);

  if (!name || name.length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters long.");
  }

  if (!allowedGenders.includes(gender)) {
    throw new HttpError(400, "Gender value is not supported.");
  }

  if (ageValue !== null && (!Number.isInteger(ageValue) || ageValue < 0 || ageValue > 120)) {
    throw new HttpError(400, "Age must be a number between 0 and 120.");
  }

  return {
    name,
    phone,
    age: ageValue,
    gender,
    bloodGroup,
    address,
  };
};

const getProfile = async (userId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new HttpError(404, "User profile was not found.");
  }

  return sanitizeUser(user);
};

const updateProfile = async (userId, input) => {
  const nextProfile = assertValidProfile(input);
  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { ...nextProfile },
    { returnDocument: "after", runValidators: true, lean: true }
  );

  if (!updatedUser) {
    throw new HttpError(404, "User profile was not found.");
  }

  return sanitizeUser(updatedUser);
};

const getSettings = async (userId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new HttpError(404, "User settings were not found.");
  }

  return user.settings || defaultSettings();
};

const updateSettings = async (userId, input) => {
  const notifications = input.notifications || {};
  const security = input.security || {};

  const updatedSettings = {
    notifications: {
      email: Boolean(notifications.email),
      sms: Boolean(notifications.sms),
      promos: Boolean(notifications.promos),
    },
    security: {
      twoFactorAuth: Boolean(security.twoFactorAuth),
      publicProfile: Boolean(security.publicProfile),
    },
  };

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    { settings: updatedSettings },
    { returnDocument: "after", runValidators: true, lean: true }
  );

  if (!updatedUser) {
    throw new HttpError(404, "User settings were not found.");
  }

  return updatedUser.settings;
};

const formatRecommendationHistoryEntry = (entry) => ({
  query: entry.query,
  mode: entry.mode,
  confidence: entry.confidence || "",
  symptom: entry.symptom,
  medicine: entry.medicine || "",
  advice: entry.advice || "",
  visit: entry.visit || "",
  severity: entry.severity || "",
  urgency: entry.urgency || "",
  matchedSymptoms: Array.isArray(entry.matchedSymptoms) ? entry.matchedSymptoms : [],
  bodySystems: Array.isArray(entry.bodySystems) ? entry.bodySystems : [],
  explanation: Array.isArray(entry.explanation) ? entry.explanation : [],
  createdAt: entry.createdAt,
});

const addRecommendationHistory = async (userId, { query, recommendation }) => {
  const entry = {
    query: String(query || "").trim(),
    mode: recommendation.mode || "unknown",
    confidence: recommendation.confidence || "",
    symptom: recommendation.symptom || "Recommendation",
    medicine: recommendation.medicine || "",
    advice: recommendation.advice || "",
    visit: recommendation.visit || "",
    severity: recommendation.severity || "",
    urgency: recommendation.urgency || "",
    matchedSymptoms: Array.isArray(recommendation.matchedSymptoms)
      ? recommendation.matchedSymptoms
      : [],
    bodySystems: Array.isArray(recommendation.bodySystems) ? recommendation.bodySystems : [],
    explanation: Array.isArray(recommendation.explanation) ? recommendation.explanation : [],
    createdAt: new Date(),
  };

  const updatedUser = await UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        recommendationHistory: {
          $each: [entry],
          $position: 0,
          $slice: 12,
        },
      },
    },
    { returnDocument: "after", runValidators: true, lean: true }
  );

  if (!updatedUser) {
    throw new HttpError(404, "User recommendation history was not found.");
  }

  return formatRecommendationHistoryEntry(updatedUser.recommendationHistory[0] || entry);
};

const getRecommendationHistory = async (userId) => {
  const user = await getUserById(userId);

  if (!user) {
    throw new HttpError(404, "User recommendation history was not found.");
  }

  return Array.isArray(user.recommendationHistory)
    ? user.recommendationHistory.map(formatRecommendationHistoryEntry)
    : [];
};

module.exports = {
  defaultSettings,
  sanitizeUser,
  normalizeEmail,
  validateEmail,
  createUserRecord,
  getUserById,
  getUserByEmail,
  getProfile,
  updateProfile,
  getSettings,
  updateSettings,
  addRecommendationHistory,
  getRecommendationHistory,
};
