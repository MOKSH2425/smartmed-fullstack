const crypto = require("crypto");
const { doctors, symptoms, defaultUser, starterAppointments } = require("../config/seed-data");
const { ensureDataFiles, readCollection, writeCollection, updateCollection } = require("../store/file-store");
const { hashPassword } = require("../utils/password");
const { createUserRecord } = require("../services/user-service");
const { createStarterReportsForUser } = require("../services/report-service");

const bootstrapData = async () => {
  await ensureDataFiles();

  const existingDoctors = await readCollection("doctors");
  if (existingDoctors.length === 0) {
    await writeCollection("doctors", doctors);
  }

  const existingSymptoms = await readCollection("symptoms");
  if (existingSymptoms.length === 0) {
    await writeCollection("symptoms", symptoms);
  }

  let users = await readCollection("users");
  let seededUser = users.find((user) => user.email === defaultUser.email) || null;

  if (users.length === 0) {
    const passwordHash = await hashPassword(defaultUser.password);
    seededUser = createUserRecord({
      name: defaultUser.name,
      email: defaultUser.email,
      passwordHash,
      profile: {
        phone: defaultUser.phone,
        age: defaultUser.age,
        gender: defaultUser.gender,
        bloodGroup: defaultUser.bloodGroup,
        address: defaultUser.address,
      },
    });

    users = [seededUser];
    await writeCollection("users", users);
  }

  if (seededUser) {
    await createStarterReportsForUser(seededUser.id);

    await updateCollection("appointments", async (appointments) => {
      const seededAppointments = appointments.filter(
        (appointment) => appointment.userId === seededUser.id
      );

      if (seededAppointments.length > 0) {
        return appointments;
      }

      const nextAppointments = starterAppointments.map((appointment) => ({
        id: crypto.randomUUID(),
        userId: seededUser.id,
        ...appointment,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return [...appointments, ...nextAppointments];
    });
  }

  return {
    seededDemoUser: seededUser
      ? {
          email: defaultUser.email,
          password: defaultUser.password,
        }
      : null,
  };
};

module.exports = { bootstrapData };
