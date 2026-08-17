export const buildFollowUpPrompt = (data: {
  candidateName: string;
  companyName: string;
  jobTitle: string;
  daysSinceLastContact: number;
  lastEventTitle?: string;
  tone?: string;
  customInfo?: string;
}): string => {
  const { candidateName, companyName, jobTitle, daysSinceLastContact, lastEventTitle, tone = 'Professional', customInfo } = data;

  return `You are an expert career coach and professional recruiter email copywriter.
Draft a follow-up email from a candidate to a recruiter or hiring manager.

Candidate Name: ${candidateName}
Company Name: ${companyName}
Role Title: ${jobTitle}
Days since last contact/activity: ${daysSinceLastContact} days
Last interaction: ${lastEventTitle || 'Application Submitted'}
Desired Email Tone: ${tone}
Custom Context/Details: ${customInfo || 'None'}

Return ONLY a JSON object in the following format:
{
  "subject": "Email Subject Line",
  "body": "Complete email body content including professional salutation and sign-off"
}`;
};
