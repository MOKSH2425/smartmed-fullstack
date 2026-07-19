const { doctors, defaultUser, starterAppointments } = require("../config/seed-data");
const { hashPassword } = require("../utils/password");
const { createUserRecord } = require("../services/user-service");
const { createStarterReportsForUser } = require("../services/report-service");
const { UserModel } = require("../models/user-model");
const { DoctorModel } = require("../models/doctor-model");
const { AppointmentModel } = require("../models/appointment-model");

const bootstrapData = async () => {
  const currentSlugs = doctors.map((doctor) => doctor.id);

  // Upsert by slug (not insert-if-empty) so adding new doctors to seed-data.js
  // reaches an already-deployed database on the next server restart, instead
  // of silently being skipped because the collection already has documents.
  await DoctorModel.bulkWrite(
    doctors.map((doctor) => ({
      updateOne: {
        filter: { slug: doctor.id },
        update: {
          $set: {
            name: doctor.name,
            specialty: doctor.specialty,
            location: doctor.location,
            clinic: doctor.clinic,
            exp: doctor.exp,
            rating: doctor.rating,
            about: doctor.about,
            availableSlots: doctor.availableSlots,
          },
        },
        upsert: true,
      },
    }))
  );

  // Remove any doctor left over from an older seed list (e.g. the previous
  // Western sample doctors) so the live database matches seed-data.js exactly.
  await DoctorModel.deleteMany({ slug: { $nin: currentSlugs } });

  let seededUser = await UserModel.findOne({ email: defaultUser.email }).lean();

  if (!seededUser) {
    const passwordHash = await hashPassword(defaultUser.password);
    const createdUser = await UserModel.create(
      createUserRecord({
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
      })
    );

    seededUser = createdUser.toObject();
  }

  if (seededUser) {
    await createStarterReportsForUser(seededUser._id);

    const seededAppointments = await AppointmentModel.countDocuments({
      userId: seededUser._id,
    });

    if (seededAppointments === 0) {
      const doctorDocs = await DoctorModel.find({
        slug: { $in: starterAppointments.map((appointment) => appointment.doctorId) },
      }).lean();

      const doctorIdBySlug = new Map(doctorDocs.map((doctor) => [doctor.slug, doctor._id]));

      await AppointmentModel.insertMany(
        starterAppointments
          .map((appointment) => {
            const doctorObjectId = doctorIdBySlug.get(appointment.doctorId);

            if (!doctorObjectId) {
              return null;
            }

            return {
              userId: seededUser._id,
              doctorId: doctorObjectId,
              date: appointment.date,
              time: appointment.time,
              status: appointment.status,
            };
          })
          .filter(Boolean)
      );
    }
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
