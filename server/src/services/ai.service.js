import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';
import { buildFollowUpPrompt } from './ai/followup.prompt.js';
import { buildInterviewPrompt } from './ai/interview.prompt.js';
import { buildCompanyPrompt } from './ai/company.prompt.js';
import { buildSalaryPrompt } from './ai/salary.prompt.js';
import { buildParserPrompt } from './ai/parser.prompt.js';

// Initialize Gemini client if key is present
const hasApiKey = !!env.GEMINI_API_KEY;
let model;

if (hasApiKey) {
  try {
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('🤖 AI Service: Gemini API Initialized successfully.');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini API:', err.message);
  }
} else {
  console.log('🤖 AI Service: Running in Simulator Mode (No GEMINI_API_KEY set).');
}

// Helper to call LLM or fallback
const callLLM = async (prompt, fallbackFunc) => {
  if (hasApiKey && model) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();
      
      // Clean up markdown block wraps if present
      if (text.startsWith('```json')) {
        text = text.substring(7, text.length - 3).trim();
      } else if (text.startsWith('```')) {
        text = text.substring(3, text.length - 3).trim();
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('⚠️ LLM call error, using simulator:', error.message);
      return fallbackFunc();
    }
  } else {
    // Simulator Mode
    return fallbackFunc();
  }
};

export const aiService = {
  // 1. Follow Up Email Generator
  generateFollowUpEmail: async (jobTitle, companyName, daysSince, lastCommunication, tone, customInfo) => {
    const prompt = buildFollowUpPrompt(jobTitle, companyName, daysSince, lastCommunication, tone, customInfo);
    
    return callLLM(prompt, () => {
      const subject = `Follow up: ${jobTitle} application at ${companyName}`;
      
      let greeting = 'Dear Hiring Team,';
      let closing = 'Best regards,\n[Your Name]';
      let content = '';

      if (tone === 'Friendly') {
        content = `I hope you're having a great week! I'm checking in on my application for the ${jobTitle} role. I'm really excited about the work ${companyName} is doing and would love to see how I can contribute.`;
      } else if (tone === 'Concise') {
        content = `I'm following up on my application for ${jobTitle}. I remain highly interested and would appreciate a brief update on the status.`;
      } else if (tone === 'Confident') {
        content = `I am writing to follow up on the ${jobTitle} position. With my background, I am confident I can make an immediate impact at ${companyName}. I look forward to discussing how my skills align with your goals.`;
      } else {
        // Professional
        content = `I hope this email finds you well. I am writing to follow up on the status of my application for the ${jobTitle} position. I remain very interested in joining ${companyName} and would welcome an update.`;
      }

      if (lastCommunication) {
        content += ` Since we last spoke regarding "${lastCommunication}", I have been keeping an eye on the company's progress.`;
      }
      if (customInfo) {
        content += ` ${customInfo}`;
      }

      return {
        subject,
        body: `${greeting}\n\n${content}\n\nThank you for your time and consideration.\n\n${closing}`,
      };
    });
  },

  // 2. Interview Success Probability
  calculateInterviewProbability: async (jobTitle, companyName, description, skills, experienceLevel) => {
    const prompt = buildInterviewPrompt(jobTitle, companyName, description, skills, experienceLevel);

    return callLLM(prompt, () => {
      // Simulate scoring
      let score = 55; // base
      const matches = [];
      const risks = [];
      const studyTopics = [];
      const likelyQuestions = [];

      // Skill-based boost
      const skillsUpper = skills.map(s => s.toUpperCase());
      const keywords = ['REACT', 'JAVASCRIPT', 'NODE', 'MONGODB', 'CSS', 'TYPESCRIPT', 'EXPRESS'];
      const matchedSkills = keywords.filter(k => skillsUpper.some(s => s.includes(k)));
      
      score += matchedSkills.length * 5;
      matchedSkills.forEach(m => matches.push(`✓ Profile matches requirement for ${m}`));
      
      if (skillsUpper.length === 0) {
        risks.push('△ No technical skills listed on profile');
      } else {
        const missing = keywords.filter(k => !matchedSkills.includes(k));
        if (missing.length > 0) {
          risks.push(`△ Profile lacks explicitly listed skills: ${missing.slice(0, 2).join(', ')}`);
        }
      }

      if (experienceLevel === 'SENIOR' || experienceLevel === 'LEAD') {
        score += 15;
        matches.push('✓ Experienced leadership profile');
      } else if (experienceLevel === 'MID_LEVEL') {
        score += 8;
        matches.push('✓ Professional mid-level background');
      } else {
        risks.push('△ Junior or Entry-level experience might face high competition');
      }

      score = Math.min(Math.max(score, 30), 95);

      let result = 'Medium Match';
      if (score >= 75) result = 'Strong Match';
      if (score < 50) result = 'Low Match';

      // Default topics and questions
      studyTopics.push('Core JavaScript principles (scopes, closures, promises)', 'REST API Design best practices', 'Database optimization & indexes');
      likelyQuestions.push(
        `Why do you want to join the team at ${companyName}?`,
        `Describe a challenging problem you solved using modern JavaScript.`,
        `How do you handle state management in complex applications?`,
        `What is your approach to optimizing page load performance?`,
        `Tell me about a time you had a technical disagreement with a team member.`
      );

      return {
        score,
        result,
        factors: [...matches, ...risks],
        recommendations: [
          'Add key developer terminology directly to your resume headline',
          'Highlight hands-on project accomplishments matching the company stack',
          'Prepare specific stories for behavioral questions'
        ],
        studyTopics,
        likelyQuestions,
      };
    });
  },

  // 3. Company Health Analyzer
  analyzeCompanyHealth: async (companyName, domain) => {
    const prompt = buildCompanyPrompt(companyName, domain);

    return callLLM(prompt, () => {
      // Create simulated company data based on name
      const nameLower = companyName.toLowerCase();
      let healthScore = 70;
      let layoffRisk = 25;
      let size = '100-500 employees';
      let industry = 'Tech / Software';
      let foundedYear = 2018;
      const factors = [];

      if (nameLower.includes('google') || nameLower.includes('microsoft') || nameLower.includes('amazon') || nameLower.includes('meta')) {
        healthScore = 85;
        layoffRisk = 15;
        size = '10000+ employees';
        industry = 'Big Tech';
        foundedYear = 1975 + (nameLower.includes('google') ? 23 : 0);
        factors.push('✓ Strong balance sheet and massive cash reserves', '✓ Dominant position in core market sectors', '△ Ongoing focus on cost-optimizations and efficiency margins');
      } else if (nameLower.includes('stripe') || nameLower.includes('openai') || nameLower.includes('shopify')) {
        healthScore = 78;
        layoffRisk = 18;
        size = '1000-5000 employees';
        industry = 'Fintech / AI';
        foundedYear = 2010;
        factors.push('✓ High market valuation and product-market fit', '✓ Active hiring in core engineering departments', '△ Industry exposure to shifting regulatory and computing costs');
      } else {
        // Startup or local firm simulation
        healthScore = 65;
        layoffRisk = 30;
        size = '51-200 employees';
        industry = 'Software & IT Services';
        foundedYear = 2021;
        factors.push('✓ Agile structure and lower overheads', '△ High reliance on VC funding landscape', '△ Competes with enterprises for top talent');
      }

      return {
        healthScore,
        layoffRisk,
        factors,
        description: `${companyName} is an innovative organization operating in the ${industry} sector, focusing on digital transformation and modern user solutions.`,
        website: domain ? `https://${domain}` : `https://www.${nameLower.replace(/\s+/g, '')}.com`,
        size,
        industry,
        foundedYear,
      };
    });
  },

  // 4. Salary Negotiation Assistant
  analyzeSalary: async (offerAmount, role, location, experienceLevel) => {
    const prompt = buildSalaryPrompt(offerAmount, role, location, experienceLevel);

    return callLLM(prompt, () => {
      // Simulate salary stats
      const baseMedian = 95000;
      const marketMin = Math.round(baseMedian * 0.85);
      const marketMax = Math.round(baseMedian * 1.25);
      const marketMedian = baseMedian;
      
      let offerEvaluation = 'Below midpoint';
      let targetSalary = Math.round(offerAmount * 1.12);
      let acceptableSalary = Math.round(offerAmount * 1.05);
      let leverageLevel = 'MEDIUM';

      if (offerAmount > marketMax) {
        offerEvaluation = 'Excellent offer';
        targetSalary = Math.round(offerAmount * 1.05);
        acceptableSalary = offerAmount;
        leverageLevel = 'LOW';
      } else if (offerAmount >= marketMedian) {
        offerEvaluation = 'Competitive';
        targetSalary = Math.round(offerAmount * 1.10);
        acceptableSalary = Math.round(offerAmount * 1.03);
        leverageLevel = 'MEDIUM';
      }

      return {
        marketMin,
        marketMax,
        marketMedian,
        offerEvaluation,
        targetSalary,
        acceptableSalary,
        leverageLevel,
        leverageFactors: [
          'High demand for React & Node full-stack skillsets in market',
          'Candidate has strong interview rating feedback',
          'Standard relocation/cost adjustments support higher ranges'
        ],
        strategy: [
          'Acknowledge and thank them for the details of the offer',
          'Frame requests around value delivery rather than personal expenses',
          'Inquire about total compensation flexibility (bonuses, health shares, PTO) if base salary is firm'
        ],
        negotiationEmail: `Subject: Job Offer Discussion - ${role}\n\nDear Recruiter,\n\nThank you very much for offering me the ${role} position. I am thrilled about the opportunity to join the team and contribute to your upcoming projects.\n\nBefore signing, I wanted to discuss the base salary. Based on my research of market rates for similar roles in ${location} and my specific experience with full-stack development, I was hoping we could explore a base salary closer to $${targetSalary.toLocaleString()}.\n\nI am very excited about the position and confident I can deliver immediate value. If we can reach a compromise closer to this figure, I would be delighted to sign and finalize everything today.\n\nThank you, and I look forward to your thoughts.\n\nBest regards,\n[Your Name]`,
      };
    });
  },

  // 5. Email Event Classifier & Entity Extractor
  parseEmail: async (sender, subject, bodyText) => {
    const prompt = buildParserPrompt(sender, subject, bodyText);

    return callLLM(prompt, () => {
      // Simulation of email parsing
      const bodyLower = bodyText.toLowerCase();
      const subjectLower = subject.toLowerCase();

      let classification = 'OTHER';
      let applicationStatus = 'UNKNOWN';
      let company = 'Unknown Company';
      let jobTitle = 'Software Engineer';
      let recruiterName = sender.split('@')[0];
      let recruiterEmail = sender;
      let interviewDate = null;
      let deadline = null;

      // Extract Company and Job Title from subject/body if visible
      const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Stripe', 'Shopify', 'OpenAI', 'Netflix'];
      const matchedCompany = companies.find(c => subjectLower.includes(c.toLowerCase()) || bodyLower.includes(c.toLowerCase()));
      if (matchedCompany) {
        company = matchedCompany;
      }

      const roles = ['Frontend Engineer', 'Backend Developer', 'React Developer', 'Software Engineer', 'Full Stack Developer', 'SWE Intern'];
      const matchedRole = roles.find(r => subjectLower.includes(r.toLowerCase()) || bodyLower.includes(r.toLowerCase()));
      if (matchedRole) {
        jobTitle = matchedRole;
      }

      if (subjectLower.includes('interview') || bodyLower.includes('interview invitation') || bodyLower.includes('schedule time')) {
        classification = 'INTERVIEW_INVITATION';
        applicationStatus = 'INTERVIEW';
        // Mock scheduling tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(10, 0, 0, 0);
        interviewDate = tomorrow.toISOString();
      } else if (subjectLower.includes('rejection') || bodyLower.includes('not move forward') || bodyLower.includes('decided to proceed with other')) {
        classification = 'REJECTION';
        applicationStatus = 'REJECTED';
      } else if (subjectLower.includes('thank you for applying') || subjectLower.includes('application received') || bodyLower.includes('received your application')) {
        classification = 'APPLICATION_CONFIRMATION';
        applicationStatus = 'APPLIED';
      } else if (subjectLower.includes('assessment') || bodyLower.includes('take-home') || bodyLower.includes('hackerrank')) {
        classification = 'ASSESSMENT';
        applicationStatus = 'ASSESSMENT';
        const inThreeDays = new Date();
        inThreeDays.setDate(inThreeDays.getDate() + 3);
        deadline = inThreeDays.toISOString();
      } else if (subjectLower.includes('offer') || bodyLower.includes('pleased to offer') || bodyLower.includes('job offer')) {
        classification = 'OFFER';
        applicationStatus = 'OFFER';
        const inFiveDays = new Date();
        inFiveDays.setDate(inFiveDays.getDate() + 5);
        deadline = inFiveDays.toISOString();
      }

      return {
        classification,
        company,
        jobTitle,
        applicationStatus,
        interviewDate,
        deadline,
        recruiterName,
        recruiterEmail,
        confidence: 0.95,
      };
    });
  },
};
export default aiService;
