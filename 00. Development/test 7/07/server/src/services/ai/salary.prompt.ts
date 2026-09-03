export const buildSalaryNegotiationPrompt = (data: {
  offerAmount: number;
  role: string;
  location?: string;
  experienceLevel?: string;
}): string => {
  const { offerAmount, role, location = 'Remote', experienceLevel = 'JUNIOR' } = data;

  return `Act as an executive compensation consultant. Benchmark the offered base salary against market rates and generate negotiation guidance.

Offered Base Salary: $${offerAmount}
Role Title: ${role}
Location: ${location}
Experience Level: ${experienceLevel}

Return ONLY a JSON object in the following format:
{
  "marketMin": 85000,
  "marketMax": 125000,
  "marketMedian": 102000,
  "offerEvaluation": "Fair / Market Rate",
  "targetSalary": 110000,
  "acceptableSalary": 100000,
  "leverageLevel": "MEDIUM",
  "leverageFactors": [
    "High market demand for full-stack React engineers",
    "Competitive skill overlap in modern web stack"
  ],
  "negotiationEmail": "Subject: Discussing Offer Details - [Role]\\n\\nDear Hiring Team,\\n\\nThank you so much for offering me the [Role] position. I am thrilled about the opportunity to contribute to the team.\\n\\nBased on market benchmarks for this role in [Location], I would like to explore if there is flexibility to adjust the base salary to $110,000.\\n\\nBest regards,\\nGuest"
}`;
};
