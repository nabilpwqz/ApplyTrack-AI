export const buildInterviewProbabilityPrompt = (data: {
  candidateProfile: any;
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  notes?: string;
}): string => {
  const { candidateProfile, jobTitle, companyName, jobDescription, notes } = data;

  return `Analyze the candidate's skills and experience against the target job posting to estimate interview probability.

Candidate Headline: ${candidateProfile?.headline || 'Engineer'}
Experience Level: ${candidateProfile?.experienceLevel || 'JUNIOR'}
Candidate Skills: ${candidateProfile?.skills?.join(', ') || 'React, JavaScript, Node.js'}

Target Job Title: ${jobTitle}
Company: ${companyName}
Job Description / Requirements: ${jobDescription || notes || 'Frontend software engineering position'}

Return ONLY a JSON object in the following format:
{
  "score": 78,
  "result": "Strong Match",
  "factors": [
    "✓ Matches core skill requirement: React",
    "✓ Experience level aligns with role expectations",
    "⚠ Missing explicit cloud deployment experience (AWS)"
  ],
  "recommendations": [
    "Highlight full-stack projects in initial screening call",
    "Emphasize state management experience"
  ],
  "studyTopics": [
    "React Virtual DOM & Profiling",
    "RESTful API architecture",
    "Asynchronous JS & Event Loop"
  ],
  "likelyQuestions": [
    "How do you handle complex state across components?",
    "Describe a challenging bug you diagnosed in React."
  ]
}`;
};
