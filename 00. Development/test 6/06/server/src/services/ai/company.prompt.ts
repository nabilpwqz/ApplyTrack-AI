export const buildCompanyHealthPrompt = (companyName: string, domain?: string, industry?: string): string => {
  return `Evaluate corporate stability indicators, funding trends, and layoff risk for the specified company.

Company Name: ${companyName}
Domain: ${domain || 'N/A'}
Industry: ${industry || 'Technology'}

Return ONLY a JSON object in the following format:
{
  "healthScore": 82,
  "layoffRisk": 14,
  "description": "Brief 2-sentence summary of company position and market stability.",
  "factors": [
    "✓ Strong cash reserves and market presence",
    "✓ Steady hiring volume in engineering",
    "⚠ Tech industry market consolidation"
  ]
}`;
};
