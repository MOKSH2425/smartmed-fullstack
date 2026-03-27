const { getRecommendation } = require("./symptom-service");

const greetingPattern = /\b(hello|hi|hey)\b/i;
const appointmentPattern = /\b(appointment|book|doctor)\b/i;

const buildGreeting = (userName) => {
  const firstName = String(userName || "there").trim().split(" ")[0];
  return `Hello ${firstName}. I can help you think through symptoms, suggest the right doctor type, or help you decide when to book an appointment.`;
};

const getChatReply = async ({ userName, message }) => {
  const cleanMessage = String(message || "").trim();

  if (!cleanMessage) {
    return {
      reply: "Please type a message so I can help.",
    };
  }

  if (greetingPattern.test(cleanMessage)) {
    return {
      reply: buildGreeting(userName),
    };
  }

  if (appointmentPattern.test(cleanMessage)) {
    return {
      reply: "You can book a specialist visit from the Doctors page. If you tell me a symptom, I can also suggest the right doctor type first.",
    };
  }

  const recommendation = await getRecommendation(cleanMessage);

  if (recommendation.found) {
    if (recommendation.mode === "emergency") {
      return {
        reply: `${recommendation.advice} Please seek ${recommendation.visit.toLowerCase()} now rather than relying only on self-treatment.`,
        recommendation,
      };
    }

    if (recommendation.mode === "fallback" || recommendation.mode === "unknown") {
      return {
        reply: `${recommendation.advice} The safest next step would be to consider a ${recommendation.visit}.`,
        recommendation,
      };
    }

    return {
      reply: `Based on what you shared, the closest match is ${recommendation.symptom.toLowerCase()}. First-line support often includes ${recommendation.medicine}. ${recommendation.advice} If symptoms worsen, book a ${recommendation.visit}.`,
      recommendation,
    };
  }

  return {
    reply: "I do not have a confident symptom match for that yet. If the issue is persistent, painful, or getting worse, please book a doctor visit for a proper diagnosis.",
  };
};

module.exports = { getChatReply };
