export const buildSalaryPrompt = (offerAmount, role, location, experienceLevel) => {
  return `You are a salary negotiation expert helping a candidate evaluate an offer.
  
  CONTEXT:
  - Offered Salary: ${offerAmount}
  - Role: ${role}
  - Location: ${location || 'Remote / Unknown'}
  - Experience Level: ${experienceLevel || '1 Year / Entry'}

  INSTRUCTIONS:
  1. Benchmark this salary for the role and location. Suggest a reasonable market range (min, max, median).
  2. Evaluate the offer (e.g., "Below midpoint", "Competitive", "Above market average").
  3. Propose a negotiation strategy (target salary, acceptable fallback, and leverage factors).
  4. Provide a leverage evaluation (LOW, MEDIUM, HIGH).
  5. Draft a polite, professional negotiation message the candidate can send to the recruiter to ask for a bump in salary.
  6. Output the response in JSON format. Do NOT wrap the JSON in markdown code blocks. Output ONLY raw valid JSON matching this schema:
  {
    "marketMin": 80000,
    "marketMax": 110000,
    "marketMedian": 95000,
    "offerEvaluation": "Below midpoint",
    "targetSalary": 100000,
    "acceptableSalary": 92000,
    "leverageLevel": "MEDIUM",
    "leverageFactors": ["Strong technical assessment", "Competitor is paying similar range"],
    "strategy": ["Thank them for the offer first", "State your target backed by research", "Inquire about flexibility on equity or signing bonus if salary is fixed"],
    "negotiationEmail": "Subject: Discussing offer - [Role]\\n\\nDear [Recruiter],\\n\\nThank you so much..."
  }
  `;
};
