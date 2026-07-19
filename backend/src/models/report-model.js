const { mongoose } = require("../db/mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    doctorName: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    status: { type: String, required: true, trim: true },
    source: { type: String, default: "manual", trim: true },
    summary: { type: String, default: "", trim: true },
    medicine: { type: String, default: "", trim: true },
    advice: { type: String, default: "", trim: true },
    specialist: { type: String, default: "", trim: true },
    severity: { type: String, default: "", trim: true },
    matchedSymptoms: [{ type: String }],
  },
  { timestamps: true }
);

const ReportModel = mongoose.models.Report || mongoose.model("Report", reportSchema);

module.exports = { ReportModel };
