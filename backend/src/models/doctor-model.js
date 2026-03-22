const { mongoose } = require("../db/mongoose");

const doctorSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    specialty: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    clinic: { type: String, required: true, trim: true },
    exp: { type: String, required: true, trim: true },
    rating: { type: Number, required: true },
    about: { type: String, default: "" },
    availableSlots: [{ type: String, required: true }],
  },
  { timestamps: true }
);

const DoctorModel = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

module.exports = { DoctorModel };
