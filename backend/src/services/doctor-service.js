const { mongoose } = require("../db/mongoose");
const { DoctorModel } = require("../models/doctor-model");
const { AppointmentModel } = require("../models/appointment-model");

const matchesFilter = (value, filterValue) => {
  if (!filterValue || filterValue === "All") {
    return true;
  }

  return String(value).toLowerCase() === String(filterValue).toLowerCase();
};

const sanitizeDoctor = (doctor) => ({
  id: String(doctor._id),
  slug: doctor.slug,
  name: doctor.name,
  specialty: doctor.specialty,
  location: doctor.location,
  clinic: doctor.clinic,
  exp: doctor.exp,
  rating: doctor.rating,
  about: doctor.about,
  availableSlots: doctor.availableSlots,
});

const listDoctors = async ({ location, specialty, search }) => {
  const doctors = await DoctorModel.find().lean();
  const searchValue = String(search || "").trim().toLowerCase();

  return doctors
    .map(sanitizeDoctor)
    .filter((doctor) => matchesFilter(doctor.location, location))
    .filter((doctor) => matchesFilter(doctor.specialty, specialty))
    .filter((doctor) => {
      if (!searchValue) {
        return true;
      }

      return [doctor.name, doctor.specialty, doctor.location, doctor.clinic]
        .join(" ")
        .toLowerCase()
        .includes(searchValue);
    })
    .sort((a, b) => b.rating - a.rating);
};

const getDoctorById = async (doctorId) => {
  if (!mongoose.isValidObjectId(doctorId)) {
    return null;
  }

  const doctor = await DoctorModel.findById(doctorId).lean();
  return doctor ? sanitizeDoctor(doctor) : null;
};

const listPreviousDoctors = async (userId) => {
  const appointments = await AppointmentModel.find({ userId })
    .sort({ date: -1, time: -1 })
    .populate("doctorId")
    .lean();

  const byDoctor = new Map();

  appointments.forEach((appointment) => {
    const doctor = appointment.doctorId;

    if (!doctor || byDoctor.has(String(doctor._id))) {
      return;
    }

    byDoctor.set(String(doctor._id), {
      id: String(doctor._id),
      name: doctor.name,
      specialty: doctor.specialty,
      clinic: doctor.clinic,
      location: doctor.location,
      rating: doctor.rating,
      lastVisit: new Date(appointment.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }),
    });
  });

  return Array.from(byDoctor.values());
};

module.exports = {
  sanitizeDoctor,
  listDoctors,
  getDoctorById,
  listPreviousDoctors,
};
