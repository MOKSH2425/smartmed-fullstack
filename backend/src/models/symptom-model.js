const { mongoose } = require("../db/mongoose");

const symptomSchema = new mongoose.Schema(
  {
    symptom: { type: String, required: true, trim: true },
    keywords: [{ type: String, required: true }],
    medicine: { type: String, required: true, trim: true },
    advice: { type: String, required: true, trim: true },
    doctorType: { type: String, required: true, trim: true },
    severity: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const SymptomModel = mongoose.models.Symptom || mongoose.model("Symptom", symptomSchema);

module.exports = { SymptomModel };
