const assert = require("node:assert/strict");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");

const { env } = require("../src/config/env");
const { connectToDatabase, disconnectFromDatabase } = require("../src/db/mongoose");
const { bootstrapData } = require("../src/bootstrap/seed");
const { app } = require("../src/app");

const logStep = (message) => console.log(`PASS: ${message}`);

const run = async () => {
  let mongoServer;

  try {
    mongoServer = await MongoMemoryServer.create();
    env.mongoUri = mongoServer.getUri("smartmed-test");

    await connectToDatabase();
    await bootstrapData();

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "demo@smartmed.app",
      password: "Demo@12345",
    });

    assert.equal(loginResponse.statusCode, 200);
    const authToken = loginResponse.body.token;
    logStep("demo login works");

    const healthResponse = await request(app).get("/api/health");
    assert.equal(healthResponse.statusCode, 200);
    assert.equal(healthResponse.body.status, "ok");
    logStep("health endpoint responds");

    const profileResponse = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${authToken}`);

    assert.equal(profileResponse.statusCode, 200);
    assert.equal(profileResponse.body.profile.email, "demo@smartmed.app");
    logStep("profile can be fetched");

    const createdPhoneNumber = `999${Date.now().toString().slice(-7)}`;
    const updateResponse = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        ...profileResponse.body.profile,
        phone: createdPhoneNumber,
      });

    assert.equal(updateResponse.statusCode, 200);
    assert.equal(updateResponse.body.profile.phone, createdPhoneNumber);
    logStep("profile can be updated");

    const refreshedProfile = await request(app)
      .get("/api/users/profile")
      .set("Authorization", `Bearer ${authToken}`);

    assert.equal(refreshedProfile.statusCode, 200);
    assert.equal(refreshedProfile.body.profile.phone, createdPhoneNumber);
    logStep("profile update persists");

    const doctorsResponse = await request(app).get("/api/doctors");
    assert.equal(doctorsResponse.statusCode, 200);
    assert.ok(doctorsResponse.body.doctors.length > 0);

    const targetDoctor = doctorsResponse.body.doctors[0];
    const appointmentDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const createResponse = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        doctorId: targetDoctor.id,
        date: appointmentDate,
        time: targetDoctor.availableSlots[0],
      });

    assert.equal(createResponse.statusCode, 201);
    logStep("appointment can be created");

    const listResponse = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${authToken}`);

    assert.equal(listResponse.statusCode, 200);
    assert.ok(
      listResponse.body.appointments.some(
        (appointment) =>
          appointment.doctorId === targetDoctor.id && appointment.date === appointmentDate
      )
    );
    logStep("appointment appears in history");

    const symptomResponse = await request(app).get(
      "/api/symptoms/recommendation?symptom=fever"
    );

    assert.equal(symptomResponse.statusCode, 200);
    assert.equal(symptomResponse.body.found, true);
    assert.match(symptomResponse.body.medicine, /Paracetamol/i);
    logStep("symptom recommendation works");

    const chatResponse = await request(app)
      .post("/api/chat")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ message: "I have a headache" });

    assert.equal(chatResponse.statusCode, 200);
    assert.match(
      chatResponse.body.reply,
      /headache|neurologist|paracetamol|ibuprofen/i
    );
    logStep("chat endpoint works");

    console.log("Backend API test suite passed.");
  } finally {
    await disconnectFromDatabase();

    if (mongoServer) {
      await mongoServer.stop();
    }
  }
};

run().catch((error) => {
  console.error("Backend API test suite failed:", error);
  process.exit(1);
});
