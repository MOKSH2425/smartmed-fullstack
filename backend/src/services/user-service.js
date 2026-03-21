const crypto = require("crypto");
const { readCollection, updateCollection } = require("../store/file-store");
const { HttpError } = require("../utils/http-error");

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
  id: user.id,
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

const createUserRecord = ({ name, email, passwordHash, profile = {} }) => {
  const timestamp = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizeEmail(email),
    passwordHash,
    phone: profile.phone || "",
    age: profile.age ?? "",
    gender: profile.gender || "Prefer not to say",
    bloodGroup: profile.bloodGroup || "",
    address: profile.address || "",
    settings: defaultSettings(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const getUserById = async (userId) => {
  const users = await readCollection("users");
  return users.find((user) => user.id === userId) || null;
};

const getUserByEmail = async (email) => {
  const users = await readCollection("users");
  return users.find((user) => user.email === normalizeEmail(email)) || null;
};

const assertValidProfile = (input) => {
  const name = String(input.name || "").trim();
  const phone = String(input.phone || "").trim();
  const address = String(input.address || "").trim();
  const bloodGroup = String(input.bloodGroup || "").trim();
  const gender = String(input.gender || "Prefer not to say").trim();
  const ageValue = input.age === "" || input.age === null ? "" : Number(input.age);

  if (!name || name.length < 2) {
    throw new HttpError(400, "Name must be at least 2 characters long.");
  }

  if (!allowedGenders.includes(gender)) {
    throw new HttpError(400, "Gender value is not supported.");
  }

  if (ageValue !== "" && (!Number.isInteger(ageValue) || ageValue < 0 || ageValue > 120)) {
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
  let updatedUser = null;

  await updateCollection("users", async (users) => {
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) {
      throw new HttpError(404, "User profile was not found.");
    }

    updatedUser = {
      ...users[index],
      ...nextProfile,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    return users;
  });

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
  let updatedSettings = null;

  await updateCollection("users", async (users) => {
    const index = users.findIndex((user) => user.id === userId);

    if (index === -1) {
      throw new HttpError(404, "User settings were not found.");
    }

    updatedSettings = {
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

    users[index] = {
      ...users[index],
      settings: updatedSettings,
      updatedAt: new Date().toISOString(),
    };

    return users;
  });

  return updatedSettings;
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
};
