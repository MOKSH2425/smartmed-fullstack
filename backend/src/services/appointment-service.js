const { mongoose } = require("../db/mongoose");
const { HttpError } = require("../utils/http-error");
const { deriveAppointmentStatus, parseAppointmentStart } = require("../utils/appointment");
const { AppointmentModel } = require("../models/appointment-model");
const { DoctorModel } = require("../models/doctor-model");

const decorateAppointment = (appointment, doctor) => {
  const status = deriveAppointmentStatus(appointment);

  return {
    id: String(appointment._id),
    doctorId: doctor ? String(doctor._id) : String(appointment.doctorId),
    doctorName: doctor?.name || "Unknown doctor",
    specialty: doctor?.specialty || "Unknown specialty",
    location: doctor?.location || "",
    clinic: doctor?.clinic || "",
    rating: doctor?.rating || null,
    date: appointment.date,
    time: appointment.time,
    status,
    createdAt: appointment.createdAt,
  };
};

const listAppointments = async (userId) => {
  const appointments = await AppointmentModel.find({ userId })
    .populate("doctorId")
    .lean();

  return appointments
    .map((appointment) => decorateAppointment(appointment, appointment.doctorId))
    .sort((a, b) => {
      const first = parseAppointmentStart(a.date, a.time)?.getTime() || 0;
      const second = parseAppointmentStart(b.date, b.time)?.getTime() || 0;
      return second - first;
    });
};

const createAppointment = async (userId, input) => {
  const doctorId = String(input.doctorId || "").trim();
  const date = String(input.date || "").trim();
  const time = String(input.time || "").trim();

  if (!doctorId || !date || !time) {
    throw new HttpError(400, "Doctor, date, and time are required to book an appointment.");
  }

  if (!mongoose.isValidObjectId(doctorId)) {
    throw new HttpError(400, "Selected doctor id is invalid.");
  }

  const doctor = await DoctorModel.findById(doctorId).lean();

  if (!doctor) {
    throw new HttpError(404, "Selected doctor was not found.");
  }

  if (!doctor.availableSlots.includes(time)) {
    throw new HttpError(400, "Selected time slot is not available for this doctor.");
  }

  const appointmentStart = parseAppointmentStart(date, time);

  if (!appointmentStart || Number.isNaN(appointmentStart.getTime())) {
    throw new HttpError(400, "Appointment date or time is invalid.");
  }

  if (appointmentStart.getTime() < Date.now()) {
    throw new HttpError(400, "Appointments must be booked for a future date and time.");
  }

  const doctorConflict = await AppointmentModel.findOne({
    doctorId,
    date,
    time,
    status: { $ne: "Cancelled" },
  }).lean();

  if (doctorConflict) {
    throw new HttpError(409, "This time slot has already been booked. Please choose another slot.");
  }

  const userConflict = await AppointmentModel.findOne({
    userId,
    date,
    time,
    status: { $ne: "Cancelled" },
  }).lean();

  if (userConflict) {
    throw new HttpError(409, "You already have an appointment scheduled for this time.");
  }

  const createdAppointment = await AppointmentModel.create({
    userId,
    doctorId,
    date,
    time,
    status: "Upcoming",
  });

  return decorateAppointment(createdAppointment.toObject(), doctor);
};

module.exports = {
  listAppointments,
  createAppointment,
};
