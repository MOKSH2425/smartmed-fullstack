const { readCollection } = require("../store/file-store");

const matchesFilter = (value, filterValue) => {
  if (!filterValue || filterValue === "All") {
    return true;
  }

  return String(value).toLowerCase() === String(filterValue).toLowerCase();
};

const listDoctors = async ({ location, specialty, search }) => {
  const doctors = await readCollection("doctors");
  const searchValue = String(search || "").trim().toLowerCase();

  return doctors
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
  const doctors = await readCollection("doctors");
  return doctors.find((doctor) => doctor.id === doctorId) || null;
};

const listPreviousDoctors = async (userId) => {
  const [appointments, doctors] = await Promise.all([
    readCollection("appointments"),
    readCollection("doctors"),
  ]);

  const doctorMap = new Map(doctors.map((doctor) => [doctor.id, doctor]));
  const byDoctor = new Map();

  appointments
    .filter((appointment) => appointment.userId === userId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach((appointment) => {
      if (byDoctor.has(appointment.doctorId)) {
        return;
      }

      const doctor = doctorMap.get(appointment.doctorId);

      if (!doctor) {
        return;
      }

      byDoctor.set(appointment.doctorId, {
        id: doctor.id,
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
  listDoctors,
  getDoctorById,
  listPreviousDoctors,
};
