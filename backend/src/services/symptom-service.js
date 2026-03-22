const { SymptomModel } = require("../models/symptom-model");

const normalize = (value) => String(value || "").trim().toLowerCase();

const getRecommendation = async (symptomText) => {
  const query = normalize(symptomText);

  if (!query) {
    return {
      found: false,
      message: "Please describe a symptom to get a recommendation.",
    };
  }

  const symptoms = await SymptomModel.find().lean();
  const match = symptoms.find((item) =>
    item.keywords.some((keyword) => query.includes(normalize(keyword)) || normalize(keyword).includes(query))
  );

  if (!match) {
    return {
      found: false,
      message: "No direct symptom match was found. Please consult a doctor for persistent or severe symptoms.",
    };
  }

  return {
    found: true,
    symptom: match.symptom,
    medicine: match.medicine,
    advice: match.advice,
    visit: match.doctorType,
    severity: match.severity,
    disclaimer: "This is not a medical diagnosis. Seek urgent care for severe, sudden, or worsening symptoms.",
  };
};

module.exports = { getRecommendation };
