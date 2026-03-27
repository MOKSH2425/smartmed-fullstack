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

const recommendationHistorySchema = new mongoose.Schema(
  {
    query: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    confidence: { type: String, default: "", trim: true },
    symptom: { type: String, required: true, trim: true },
    medicine: { type: String, default: "", trim: true },
    advice: { type: String, default: "", trim: true },
    visit: { type: String, default: "", trim: true },
    severity: { type: String, default: "", trim: true },
    urgency: { type: String, default: "", trim: true },
    matchedSymptoms: [{ type: String }],
    bodySystems: [{ type: String }],
    explanation: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
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
    recommendationHistory: {
      type: [recommendationHistorySchema],
      default: () => [],
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = { UserModel };
