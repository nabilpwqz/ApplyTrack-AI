export const buildInterviewPrompt = (jobTitle, companyName, description, skills, experienceLevel) => {
  return `You are a recruiter scoring a job applicant for an interview.
  
  CONTEXT:
  - Job Title: ${jobTitle}
  - Company: ${companyName}
  - Job Description (if available): ${description || 'Not provided'}
  - Candidate Skills: ${skills.join(', ') || 'Not provided'}
  - Candidate Experience Level: ${experienceLevel || 'JUNIOR'}

  INSTRUCTIONS:
  1. Score the likelihood of the candidate getting an interview out of 100 based on the alignment of skills and experience.
  2. List positive factors (what aligns) and risk factors (what is missing or weak).
  3. Formulate 5 likely interview questions (mix of technical and behavioral) specific to this role and company.
  4. Suggest 3-5 critical study topics.
  5. Output the response in JSON format. Do NOT wrap the JSON in markdown code blocks. Output ONLY raw valid JSON matching this schema:
  {
    "score": 75,
    "result": "Strong Match / Medium Match / Low Match",
    "factors": ["React matches job", "Missing AWS experience"],
    "recommendations": ["Highlight your React projects in your resume", "Learn basic AWS S3 and EC2 concepts"],
    "studyTopics": ["React virtual DOM", "State management in large apps"],
    "likelyQuestions": ["Why do you want to work at this company?", "Explain React rendering cycle."]
  }
  `;
};
