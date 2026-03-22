const { mongoose } = require("../db/mongoose");

const settingsSchema = new mongoose.Schema(
  {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      promos: { type: Boolean, default: true },
    },
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      publicProfile: { type: Boolean, default: false },
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "" },
    age: { type: Number, default: null },
    gender: { type: String, default: "Prefer not to say" },
    bloodGroup: { type: String, default: "" },
    address: { type: String, default: "" },
    settings: { type: settingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = { UserModel };
