const {
  symptomCatalog,
  redFlagCatalog,
  conditionCatalog,
  bodySystemGuidance,
} = require("../config/medical-catalog");

const disclaimer =
  "Educational support only. This is not a final medical diagnosis or prescription. Seek urgent care for severe, sudden, or worsening symptoms.";

const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildPattern = (alias) => new RegExp(`(^|\\b)${escapeRegExp(alias)}(\\b|$)`, "i");

const aliasMatchesQuery = (query, alias) => {
  if (buildPattern(alias).test(query)) {
    return true;
  }

  const aliasTokens = alias.split(" ").filter(Boolean);
  if (aliasTokens.length <= 1) {
    return false;
  }

  return aliasTokens.every((token) => buildPattern(token).test(query));
};

const flattenAliases = (item) => [
  item.label,
  item.key.replace(/_/g, " "),
  ...(item.aliases || []),
].map(normalizeText);

const symptomPatterns = symptomCatalog.map((item) => ({
  ...item,
  aliasesNormalized: flattenAliases(item),
}));

const redFlagPatterns = redFlagCatalog.map((item) => ({
  ...item,
  aliasesNormalized: flattenAliases(item),
}));

const scoreCondition = (condition, matchedSymptomsSet) => {
  const weights = condition.symptomWeights || {};
  const entries = Object.entries(weights);

  let matchedWeight = 0;
  let matchedSymptoms = [];

  for (const [symptomKey, weight] of entries) {
    if (matchedSymptomsSet.has(symptomKey)) {
      matchedWeight += weight;
      matchedSymptoms.push(symptomKey);
    }
  }

  if (matchedSymptoms.length === 0) {
    return null;
  }

  if (
    Array.isArray(condition.requiredAny) &&
    condition.requiredAny.length > 0 &&
    !condition.requiredAny.some((symptomKey) => matchedSymptomsSet.has(symptomKey))
  ) {
    return null;
  }

  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  const coverage = matchedWeight / totalWeight;
  const optionalBoost = (condition.optionalBoost || []).reduce(
    (sum, symptomKey) => sum + (matchedSymptomsSet.has(symptomKey) ? 0.8 : 0),
    0
  );
  const negativePenalty = (condition.negativeSignals || []).reduce(
    (sum, symptomKey) => sum + (matchedSymptomsSet.has(symptomKey) ? 1.1 : 0),
    0
  );

  const finalScore = matchedWeight + coverage * 2 + optionalBoost - negativePenalty;

  return {
    ...condition,
    matchedSymptoms,
    matchedWeight,
    coverage,
    finalScore,
  };
};

const getConfidence = (score) => {
  if (score >= 8) {
    return "high";
  }

  if (score >= 5) {
    return "medium";
  }

  if (score >= 3) {
    return "low";
  }

  return "weak";
};

const unique = (items) => [...new Set(items)];

const labelsForSymptoms = (keys) =>
  keys
    .map((key) => symptomCatalog.find((item) => item.key === key)?.label)
    .filter(Boolean);

const extractMatches = (query, catalog) => {
  const matches = [];

  for (const item of catalog) {
    const matchedAlias = item.aliasesNormalized.find((alias) => aliasMatchesQuery(query, alias));

    if (matchedAlias) {
      matches.push({
        ...item,
        matchedAlias,
      });
    }
  }

  return matches;
};

const buildEmergencyResponse = (matchedRedFlags) => {
  const labels = matchedRedFlags.map((item) => item.label);
  const primaryMessage = matchedRedFlags[0]?.message || "Seek immediate medical care.";

  return {
    found: true,
    mode: "emergency",
    confidence: "high",
    symptom: "Emergency warning signs detected",
    medicine: "Do not rely only on home treatment.",
    advice: primaryMessage,
    visit: "Emergency Care",
    severity: "Emergency attention recommended",
    urgency: matchedRedFlags[0]?.urgency || "emergency",
    matchedSymptoms: labels,
    matchedRedFlags: labels,
    bodySystems: unique(matchedRedFlags.flatMap((item) => item.bodySystems || [])),
    explanation: [`Red-flag symptoms detected: ${labels.join(", ")}`],
    disclaimer,
  };
};

const buildFallbackResponse = (matchedSymptoms, rankedConditions) => {
  const matchedSymptomKeys = matchedSymptoms.map((item) => item.key);
  const bodySystems = unique(matchedSymptoms.flatMap((item) => item.bodySystems || []));
  const topBodySystem = bodySystems[0] || "general";
  const guidance = bodySystemGuidance[topBodySystem] || bodySystemGuidance.general;
  const possibleAreas = rankedConditions.slice(0, 3).map((item) => item.name);

  return {
    found: true,
    mode: matchedSymptoms.length > 0 ? "fallback" : "unknown",
    confidence: matchedSymptoms.length > 0 ? "low" : "weak",
    symptom: matchedSymptoms.length > 0 ? "General symptom guidance" : "More detail needed",
    medicine:
      matchedSymptoms.length > 0
        ? "No specific OTC medicine is recommended until symptoms are clearer."
        : "Please add 2 or 3 symptom details for better guidance.",
    advice:
      matchedSymptoms.length > 0
        ? guidance.advice.join(" ")
        : "I could not confidently map that input. Try entering a few symptoms together, for example fever, cough, and body ache.",
    visit: guidance.specialist,
    severity: matchedSymptoms.length > 0 ? "Needs more detail" : "Insufficient information",
    urgency: "routine",
    bodySystems,
    matchedSymptoms: labelsForSymptoms(matchedSymptomKeys),
    possibleAreas,
    explanation:
      matchedSymptoms.length > 0
        ? [
            `Recognized symptom groups: ${labelsForSymptoms(matchedSymptomKeys).join(", ")}`,
            `Body system focus: ${bodySystems.join(", ") || "general"}`,
          ]
        : ["No clear symptom match was recognized from the input."],
    disclaimer,
  };
};

const buildConditionResponse = (topCondition, rankedConditions) => {
  const matchedLabels = labelsForSymptoms(topCondition.matchedSymptoms);
  const confidence = getConfidence(topCondition.finalScore);

  return {
    found: true,
    mode: "condition_match",
    confidence,
    symptom: topCondition.name,
    medicine: topCondition.otcMedicines.join(", "),
    advice: topCondition.homeAdvice.join(" "),
    visit: topCondition.specialist,
    severity: topCondition.severity,
    urgency: topCondition.urgency,
    bodySystems: topCondition.bodySystems,
    matchedSymptoms: matchedLabels,
    topCondition: {
      key: topCondition.key,
      name: topCondition.name,
      score: Number(topCondition.finalScore.toFixed(2)),
      severity: topCondition.severity,
      urgency: topCondition.urgency,
      otcMedicines: topCondition.otcMedicines,
      homeAdvice: topCondition.homeAdvice,
      specialist: topCondition.specialist,
    },
    alternatives: rankedConditions.slice(1, 4).map((item) => ({
      key: item.key,
      name: item.name,
      score: Number(item.finalScore.toFixed(2)),
    })),
    explanation: [
      `Matched symptoms: ${matchedLabels.join(", ")}`,
      `Primary body systems: ${topCondition.bodySystems.join(", ")}`,
    ],
    disclaimer,
  };
};

const getRecommendation = async (symptomText) => {
  const query = normalizeText(symptomText);

  if (!query) {
    return {
      found: false,
      message: "Please describe one or more symptoms to get a recommendation.",
    };
  }

  const matchedRedFlags = extractMatches(query, redFlagPatterns);
  if (matchedRedFlags.length > 0) {
    return buildEmergencyResponse(matchedRedFlags);
  }

  const matchedSymptoms = extractMatches(query, symptomPatterns);
  const matchedSymptomsSet = new Set(matchedSymptoms.map((item) => item.key));

  const rankedConditions = conditionCatalog
    .map((condition) => scoreCondition(condition, matchedSymptomsSet))
    .filter(Boolean)
    .sort((left, right) => right.finalScore - left.finalScore);

  const topCondition = rankedConditions[0];

  if (!topCondition || topCondition.finalScore < 3) {
    return buildFallbackResponse(matchedSymptoms, rankedConditions);
  }

  return buildConditionResponse(topCondition, rankedConditions);
};

module.exports = { getRecommendation };
