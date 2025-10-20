# 🩺 Ksense Healthcare API Assessment

**Author:** Alexia Valenzuela  
**Tech Stack:** Node.js, Axios, JavaScript  
**Focus:** API Integration, Data Validation, Risk Scoring, and Automated Reporting  

---

## 📖 Overview

This project was built as part of the **Ksense Technical Take-Home Assessment**.  
It demonstrates API integration, error handling, data parsing, and programmatic submission of results to a simulated healthcare system.

The script connects to the **DemoMed Healthcare API**, retrieves paginated patient data, computes custom **risk scores**, detects **data inconsistencies**, and submits processed results back to the assessment endpoint.

---

## 🧠 Features
  

---

## ⚙️ Setup Instructions
1. Fetch all patient pages from
https://assessment.ksensetech.com/api/patients?page=1&limit=5
using your API key.
2. Handle rate limits (429) and random 500/503 errors with retry logic.
3. Parse blood pressure, temperature, and age for each patient.
4. Compute total risk score:
- Blood Pressure (1–4 pts)
- Temperature (0–2 pts)
- Age (1–2 pts)
5.	Build 3 lists:
-high_risk_patients → total score ≥ 4
-fever_patients → temperature ≥ 99.6°F
-data_quality_issues → invalid/missing BP, Temp, or Age

### 1. Clone the repository
```bash
git clone https://github.com/your-username/ksense-assessment.git
cd ksense-assessment