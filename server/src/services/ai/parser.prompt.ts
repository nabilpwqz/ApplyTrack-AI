export const buildEmailParserPrompt = (emailText: string, sender: string, subject: string): string => {
  return `You are an AI recruiter email parser. Analyze the incoming email and extract structured job application updates.

Sender: ${sender}
Subject: ${subject}
Body: ${emailText}

Extract structured metadata. Map applicationStatus to one of: APPLIED, SCREENING, ASSESSMENT, INTERVIEW, OFFER, REJECTED, GHOSTED.

Return ONLY a JSON object in the format:
{
  "company": "Company Name",
  "jobTitle": "Job Role Title",
  "applicationStatus": "INTERVIEW",
  "recruiterEmail": "email@company.com",
  "confidence": 0.95,
  "summary": "Brief summary of email"
}`;
};
