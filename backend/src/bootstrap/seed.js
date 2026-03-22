const { doctors, symptoms, defaultUser, starterAppointments } = require("../config/seed-data");
const { hashPassword } = require("../utils/password");
const { createUserRecord } = require("../services/user-service");
const { createStarterReportsForUser } = require("../services/report-service");
const { UserModel } = require("../models/user-model");
const { DoctorModel } = require("../models/doctor-model");
const { SymptomModel } = require("../models/symptom-model");
const { AppointmentModel } = require("../models/appointment-model");

const bootstrapData = async () => {
  const doctorCount = await DoctorModel.countDocuments();
  if (doctorCount === 0) {
    await DoctorModel.insertMany(
      doctors.map((doctor) => ({
        slug: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty,
        location: doctor.location,
        clinic: doctor.clinic,
        exp: doctor.exp,
        rating: doctor.rating,
        about: doctor.about,
        availableSlots: doctor.availableSlots,
      }))
    );
  }

  const symptomCount = await SymptomModel.countDocuments();
  if (symptomCount === 0) {
    await SymptomModel.insertMany(symptoms);
  }

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
