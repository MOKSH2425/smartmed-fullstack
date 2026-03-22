const { startServer } = require("../server");

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const makeFutureDate = () => {
  const target = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return target.toISOString().slice(0, 10);
};

const run = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI before running backend verification.");
  }

  const server = await startServer({ port: 0 });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 5000;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const healthResponse = await fetch(`${baseUrl}/api/health`);
    const health = await healthResponse.json();
    assert(health.status === "ok", "Health endpoint did not return ok.");
    console.log("Verified health endpoint.");

    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "demo@smartmed.app",
        password: "Demo@12345",
      }),
    });
    const loginData = await loginResponse.json();
    assert(loginResponse.ok, `Login failed: ${loginData.message}`);
    assert(loginData.token, "Login did not return a token.");
    console.log("Verified login endpoint.");

    const authHeaders = {
      Authorization: `Bearer ${loginData.token}`,
      "Content-Type": "application/json",
    };

    const doctorsResponse = await fetch(`${baseUrl}/api/doctors`);
    const doctorsData = await doctorsResponse.json();
    assert(doctorsResponse.ok, "Doctors endpoint failed.");
    assert(doctorsData.doctors.length > 0, "Doctors endpoint returned no doctors.");
    console.log("Verified doctors endpoint.");

    const profileResponse = await fetch(`${baseUrl}/api/users/profile`, {
      headers: authHeaders,
    });
    const profileData = await profileResponse.json();
    assert(profileResponse.ok, "Profile endpoint failed.");
    assert(profileData.profile.email === "demo@smartmed.app", "Profile data was incorrect.");
    console.log("Verified profile endpoint.");

    const appointmentResponse = await fetch(`${baseUrl}/api/appointments`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        doctorId: doctorsData.doctors[0].id,
        date: makeFutureDate(),
        time: doctorsData.doctors[0].availableSlots[0],
      }),
    });
    const appointmentData = await appointmentResponse.json();
    assert(
      appointmentResponse.ok || appointmentResponse.status === 409,
      `Appointment booking failed: ${appointmentData.message}`
    );
    console.log("Verified appointment creation endpoint.");

    const appointmentsResponse = await fetch(`${baseUrl}/api/appointments`, {
      headers: authHeaders,
    });
    const appointmentsData = await appointmentsResponse.json();
    assert(appointmentsResponse.ok, "Appointments list endpoint failed.");
    assert(appointmentsData.appointments.length > 0, "Appointments list returned no appointments.");
    console.log("Verified appointment listing endpoint.");

    const reportsResponse = await fetch(`${baseUrl}/api/reports`, {
      headers: authHeaders,
    });
    const reportsData = await reportsResponse.json();
    assert(reportsResponse.ok, "Reports endpoint failed.");
    assert(reportsData.reports.length > 0, "Reports endpoint returned no reports.");
    console.log("Verified reports endpoint.");

    const symptomResponse = await fetch(
      `${baseUrl}/api/symptoms/recommendation?symptom=fever`
    );
    const symptomData = await symptomResponse.json();
    assert(symptomResponse.ok, "Symptom endpoint failed.");
    assert(symptomData.found === true, "Symptom recommendation did not match fever.");
    console.log("Verified symptom recommendation endpoint.");

    const chatResponse = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ message: "I have a headache" }),
    });
    const chatData = await chatResponse.json();
    assert(chatResponse.ok, "Chat endpoint failed.");
    assert(chatData.reply, "Chat endpoint did not return a reply.");
    console.log("Verified chat endpoint.");

    console.log("Backend verification passed.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

run().catch((error) => {
  console.error("Backend verification failed:", error);
  process.exit(1);
});
