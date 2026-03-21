const crypto = require("crypto");
const { readCollection, updateCollection } = require("../store/file-store");
const { HttpError } = require("../utils/http-error");
const { deriveAppointmentStatus, parseAppointmentStart } = require("../utils/appointment");
const { getDoctorById } = require("./doctor-service");

const decorateAppointment = (appointment, doctorMap) => {
  const doctor = doctorMap.get(appointment.doctorId);
  const status = deriveAppointmentStatus(appointment);

  return {
    id: appointment.id,
    doctorId: appointment.doctorId,
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
  const [appointments, doctors] = await Promise.all([
    readCollection("appointments"),
    readCollection("doctors"),
  ]);

  const doctorMap = new Map(doctors.map((doctor) => [doctor.id, doctor]));

  return appointments
    .filter((appointment) => appointment.userId === userId)
    .map((appointment) => decorateAppointment(appointment, doctorMap))
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

  const doctor = await getDoctorById(doctorId);

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

  let createdAppointment = null;

  await updateCollection("appointments", async (appointments) => {
    const doctorConflict = appointments.find(
      (appointment) =>
        appointment.doctorId === doctorId &&
        appointment.date === date &&
        appointment.time === time &&
        appointment.status !== "Cancelled"
    );

    if (doctorConflict) {
      throw new HttpError(409, "This time slot has already been booked. Please choose another slot.");
    }

    const userConflict = appointments.find(
      (appointment) =>
        appointment.userId === userId &&
        appointment.date === date &&
        appointment.time === time &&
        appointment.status !== "Cancelled"
    );

    if (userConflict) {
      throw new HttpError(409, "You already have an appointment scheduled for this time.");
    }

    createdAppointment = {
      id: crypto.randomUUID(),
      userId,
      doctorId,
      date,
      time,
      status: "Upcoming",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    appointments.push(createdAppointment);
    return appointments;
  });

  const doctorMap = new Map([[doctor.id, doctor]]);
  return decorateAppointment(createdAppointment, doctorMap);
};

module.exports = {
  listAppointments,
  createAppointment,
};
