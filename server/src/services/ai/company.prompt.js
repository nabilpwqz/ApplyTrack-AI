export const buildCompanyPrompt = (companyName, domain) => {
  return `You are a financial and industry analyst evaluating a company's hiring health and layoff risks.
  
  COMPANY DETAIL:
  - Name: ${companyName}
  - Domain (if available): ${domain || 'Not provided'}

  INSTRUCTIONS:
  1. Determine the estimated corporate health score (0-100, 100 being excellent stability and growth).
  2. Determine the estimated layoff risk (0-100%, where 100% means imminent or ongoing layoffs).
  3. Compile 4-5 health signals (e.g., funding rounds, headcount trends, hiring velocity, industry growth).
  4. Provide a brief description of the company, its website, size group (e.g. "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+ employees"), industry, and approximate founded year.
  5. Output the response in JSON format. Do NOT wrap the JSON in markdown code blocks. Output ONLY raw valid JSON matching this schema:
  {
    "healthScore": 82,
    "layoffRisk": 12,
    "factors": ["+ Hiring actively for tech roles", "+ Strong growth in cloud computing sector", "- Recent senior leadership departures"],
    "description": "Short description of the company.",
    "website": "https://companywebsite.com",
    "size": "501-1000 employees",
    "industry": "Software / SaaS",
    "foundedYear": 2015
  }
  `;
};
