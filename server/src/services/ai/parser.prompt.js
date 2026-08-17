export const buildParserPrompt = (sender, subject, bodyText) => {
  return `You are an automated email classifier for a job tracking application.
  
  EMAIL RECEIVED:
  - From: ${sender}
  - Subject: ${subject}
  - Body:
  ${bodyText}

  INSTRUCTIONS:
  1. Classify the email into one of these types:
     - APPLICATION_CONFIRMATION (acknowledgment of application submission)
     - REJECTION (rejection email)
     - INTERVIEW_INVITATION (invitation for a sync, screen, technical, or panel interview)
     - ASSESSMENT (take-home assignment, hackerrank, coderpad, etc.)
     - OFFER (job offer sent)
     - RECRUITER_MESSAGE (general chat or info request)
     - FOLLOW_UP (follow-up regarding application)
     - OTHER (unrelated)
  2. Map the classification to a corresponding ApplyTrack application status:
     - APPLICATION_CONFIRMATION -> APPLIED
     - REJECTION -> REJECTED
     - INTERVIEW_INVITATION -> INTERVIEW
     - ASSESSMENT -> ASSESSMENT
     - OFFER -> OFFER
     - RECRUITER_MESSAGE -> SCREENING
     - FOLLOW_UP -> SCREENING
     - OTHER -> UNKNOWN
  3. Extract details: company name, job title, interview date/time (if scheduled), deadline (for assessment/offer, if any), recruiter's name, and recruiter's email.
  4. Estimate classification confidence (0.0 to 1.0).
  5. Output the response in JSON format. Do NOT wrap the JSON in markdown code blocks. Output ONLY raw valid JSON matching this schema:
  {
    "classification": "INTERVIEW_INVITATION",
    "company": "Google",
    "jobTitle": "Frontend Engineer",
    "applicationStatus": "INTERVIEW",
    "interviewDate": "2026-08-20T10:00:00Z", 
    "deadline": null,
    "recruiterName": "John Doe",
    "recruiterEmail": "john.doe@google.com",
    "confidence": 0.95
  }
  
  Ensure dates are formatted in ISO 8601 (YYYY-MM-DDTHH:mm:ssZ). If a detail is missing, set it to null.
  `;
};
