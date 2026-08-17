export const buildFollowUpPrompt = (jobTitle, companyName, daysSince, lastCommunication, tone, customInfo) => {
  return `You are an expert career coach helping a candidate draft a professional follow-up email.
  
  CONTEXT:
  - Role: ${jobTitle}
  - Company: ${companyName}
  - Days since last action/apply: ${daysSince} days
  - Previous interaction details: ${lastCommunication || 'None'}
  - Custom details: ${customInfo || 'None'}
  - Desired tone: ${tone} (choose from: Professional, Friendly, Concise, Confident)

  INSTRUCTIONS:
  1. Generate a subject line and the email body.
  2. Maintain the chosen tone strictly.
  3. Keep placeholders like [Your Name], [Contact Name] in clear brackets so the user knows to replace them, but tailor the content of the letter to the specific inputs.
  4. Output the response in JSON format. Do NOT wrap the JSON in markdown code blocks. Output ONLY raw valid JSON matching this schema:
  {
    "subject": "Subject of the email",
    "body": "Body of the email (use \\n for line breaks)"
  }
  `;
};
