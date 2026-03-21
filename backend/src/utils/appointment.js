const parseAppointmentStart = (date, time) => {
  const match = /^(\d{2}):(\d{2})\s(AM|PM)$/.exec(String(time || "").trim());

  if (!date || !match) {
    return null;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3];

  if (meridiem === "PM" && hours !== 12) {
    hours += 12;
  }

  if (meridiem === "AM" && hours === 12) {
    hours = 0;
  }

  return new Date(
    `${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`
  );
};

const deriveAppointmentStatus = (appointment) => {
  if (appointment.status === "Cancelled") {
    return "Cancelled";
  }

  const startsAt = parseAppointmentStart(appointment.date, appointment.time);

  if (!startsAt) {
    return appointment.status || "Upcoming";
  }

  return startsAt.getTime() < Date.now() ? "Completed" : "Upcoming";
};

module.exports = { parseAppointmentStart, deriveAppointmentStatus };
