const { mongoose } = require("../db/mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: { type: String, default: "Upcoming" },
  },
  { timestamps: true }
);

const AppointmentModel =
  mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

module.exports = { AppointmentModel };
