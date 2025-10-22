// ==============================================
//  KSense Healthcare API Assessment
//  Author: Alexia Valenzuela
//  Description: Fetches patient data, handles retries, 
//  and evaluates patient risk scoring logic.
// ==============================================

// ========== STEP 1: SETUP & CONFIGURATION ==========
import "dotenv/config";
import axios from "axios";

// Load constants
const API_KEY = process.env.KSENSE_API_KEY;
const BASE_URL = "https://assessment.ksensetech.com/api";

// Simple delay function for retry backoff
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Log to confirm environment setup
console.log("Loaded API Key:", API_KEY ? "✅ Found" : "❌ Missing");

// ========== STEP 2: RETRY LOGIC FOR API REQUESTS ==========
// This handles rate limiting (429) and temporary failures (500/503)
async function fetchWithRetry(url, options = {}, attempts = 5, backoff = 500) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await axios.get(url, options);
      return res.data;
    } catch (e) {
      lastError = e;
      const status = e.response?.status;

      // Retry on rate limit or server error
      if ([429, 500, 503].includes(status)) {
        console.warn(`⚠️ Attempt ${i + 1} failed (status ${status}). Retrying...`);
        await delay(backoff * (i + 1));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

// ========== STEP 3: FETCH TEST PAGE ==========
async function fetchOnePage(page = 1, limit = 5) {
  const res = await axios.get(`${BASE_URL}/patients?page=${page}&limit=${limit}`, {
    headers: { "x-api-key": API_KEY },
  });
  return res.data;
}

// Run initial test fetch
(async () => {
  try {
    console.log("🔹 Fetching sample patient page...");
    const data = await fetchOnePage(1);
    console.log("✅ Sample page keys:", Object.keys(data));
    console.log("🩺 First patient sample:", data.data?.[0]);
  } catch (err) {
    console.error("❌ Fetch failed:", err.message);
  }
})();

// ==========================================================
//  PSEUDOCODE — FUTURE STEPS (LOGIC OUTLINE)
// ==========================================================

/*
DEFINE fetchPatients():
  INITIALIZE empty list ALL_PATIENTS
  SET PAGE = 1
  SET HAS_NEXT = true

  WHILE HAS_NEXT IS TRUE:
      TRY:
          SEND GET request to BASE_URL + "/patients?page=PAGE&limit=5"
              with header { "x-api-key": API_KEY }
          PARSE response JSON into DATA
          ADD DATA.data (patient list) to ALL_PATIENTS
          UPDATE HAS_NEXT using DATA.pagination.hasNext
          INCREMENT PAGE by 1
      CATCH error:
          IF error status is 429 OR 500 OR 503:
              PRINT "Retrying..."
              WAIT 1 second
          ELSE:
              PRINT "Failed request", stop fetching
              SET HAS_NEXT to FALSE
  RETURN ALL_PATIENTS


DEFINE parseBloodPressure(bp):
  IF bp is null OR empty OR not in "number/number" format → RETURN null
  SPLIT bp into SYSTOLIC and DIASTOLIC as numbers
  IF either value is NaN → RETURN null
  APPLY scoring rules:
      Normal (<120 and <80) → 1
      Elevated (120–129 and <80) → 2
      Stage 1 (130–139 or 80–89) → 3
      Stage 2 (≥140 or ≥90) → 4
  RETURN score


DEFINE temperatureRisk(temp):
  CONVERT temp to number
  IF invalid → RETURN null
  IF ≤99.5 → 0
  ELSE IF 99.6–100.9 → 1
  ELSE IF ≥101.0 → 2
  RETURN score


DEFINE ageRisk(age):
  CONVERT age to number
  IF invalid → RETURN null
  IF >65 → 2
  ELSE IF 40–65 → 1
  ELSE IF <40 → 1
  RETURN score


DEFINE evaluatePatients(patientList):
  INITIALIZE empty arrays HIGH_RISK, FEVER, QUALITY_ISSUES

  FOR EACH PATIENT in patientList:
      COMPUTE bpScore = parseBloodPressure(PATIENT.blood_pressure)
      COMPUTE tempScore = temperatureRisk(PATIENT.temperature)
      COMPUTE ageScore = ageRisk(PATIENT.age)

      IF any of bpScore, tempScore, ageScore is null:
          ADD PATIENT.patient_id to QUALITY_ISSUES

      COMPUTE totalScore = (bpScore or 0) + (tempScore or 0) + (ageScore or 0)

      IF totalScore ≥ 4:
          ADD PATIENT.patient_id to HIGH_RISK

      IF temperature ≥ 99.6°F:
          ADD PATIENT.patient_id to FEVER
  RETURN { HIGH_RISK, FEVER, QUALITY_ISSUES }


DEFINE submitResults(results):
  CREATE JSON payload:
      {
        "high_risk_patients": results.HIGH_RISK,
        "fever_patients": results.FEVER,
        "data_quality_issues": results.QUALITY_ISSUES
      }
  SEND POST request to BASE_URL + "/submit-assessment"
      with headers { "x-api-key": API_KEY, "Content-Type": "application/json" }
  LOG response or handle error


MAIN EXECUTION:
  PRINT "Fetching patients..."
  CALL fetchPatients() → PATIENTS
  PRINT total number fetched

  PRINT "Evaluating patient risk..."
  CALL evaluatePatients(PATIENTS) → RESULTS

  PRINT "Submitting results..."
  CALL submitResults(RESULTS)
*/

// END PROGRAM