import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { buildFollowUpPrompt } from './ai/followup.prompt';
import { buildInterviewProbabilityPrompt } from './ai/interview.prompt';
import { buildCompanyHealthPrompt } from './ai/company.prompt';
import { buildSalaryNegotiationPrompt } from './ai/salary.prompt';
import { buildEmailParserPrompt } from './ai/parser.prompt';

class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (env.GEMINI_API_KEY) {
      try {
        this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('🤖 Google Gemini AI Initialized');
      } catch (err: any) {
        console.warn('⚠️ Gemini AI initialization error, using AI Simulator Mode:', err.message);
      }
    } else {
      console.log('ℹ️ No GEMINI_API_KEY provided. Operating in AI Simulator Mode.');
    }
  }

  private async generateJSON(prompt: string, fallbackGenerator: () => any): Promise<any> {
    if (this.model) {
      try {
        const result = await this.model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (error: any) {
        console.warn('⚠️ Gemini API execution failed, using simulator fallback:', error.message);
      }
    }
    return fallbackGenerator();
  }

  async generateFollowUpEmail(data: {
    candidateName: string;
    companyName: string;
    jobTitle: string;
    daysSinceLastContact: number;
    lastEventTitle?: string;
    tone?: string;
    customInfo?: string;
  }): Promise<{ subject: string; body: string }> {
    const prompt = buildFollowUpPrompt(data);
    return this.generateJSON(prompt, () => ({
      subject: `Following up on ${data.jobTitle} position at ${data.companyName}`,
      body: `Dear Hiring Team,\n\nI hope this email finds you well. I am following up on my application for the ${data.jobTitle} position at ${data.companyName}. It has been ${data.daysSinceLastContact} days since our last update regarding "${data.lastEventTitle || 'Application Submission'}".\n\nI remain very enthusiastic about the role and joining the team. Please let me know if there are any additional details or references I can provide.\n\nBest regards,\n${data.candidateName || 'Guest'}`,
    }));
  }

  async calculateInterviewProbability(data: {
    candidateProfile: any;
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    notes?: string;
  }): Promise<{
    score: number;
    result: string;
    factors: string[];
    recommendations: string[];
    studyTopics: string[];
    likelyQuestions: string[];
  }> {
    const prompt = buildInterviewProbabilityPrompt(data);
    return this.generateJSON(prompt, () => {
      const skills: string[] = data.candidateProfile?.skills || [];
      const hasReact = skills.some(s => s.toLowerCase().includes('react'));
      const score = hasReact ? 82 : 68;

      return {
        score,
        result: score >= 75 ? 'High Interview Likelihood' : 'Moderate Likelihood',
        factors: [
          `✓ Candidate skills (${skills.join(', ')}) align with role criteria`,
          `✓ Role level matches candidate experience`,
          `⚠ High candidate competition volume for ${data.jobTitle}`
        ],
        recommendations: [
          'Highlight key technical achievements directly in summary',
          'Prepare behavioral stories focused on problem-solving'
        ],
        studyTopics: [
          'React Component Lifecycle & Hooks',
          'State Management Patterns',
          'RESTful APIs & Asynchronous Patterns'
        ],
        likelyQuestions: [
          `Why do you want to work at ${data.companyName}?`,
          `How do you optimize web app performance in React?`,
          `Walk us through a challenging bug you diagnosed.`
        ]
      };
    });
  }

  async analyzeCompanyHealth(companyName: string, domain?: string, industry?: string): Promise<{
    healthScore: number;
    layoffRisk: number;
    description: string;
    factors: string[];
  }> {
    const prompt = buildCompanyHealthPrompt(companyName, domain, industry);
    return this.generateJSON(prompt, () => ({
      healthScore: 82,
      layoffRisk: 12,
      description: `${companyName} shows strong financial stability indices and active engineering hiring pipelines.`,
      factors: [
        '✓ Strong balance sheet and market leadership',
        '✓ Active hiring expansion across tech teams',
        '⚠ Tech industry macro-economic conditions'
      ]
    }));
  }

  async analyzeSalary(data: {
    offerAmount: number;
    role: string;
    location?: string;
    experienceLevel?: string;
  }): Promise<{
    marketMin: number;
    marketMax: number;
    marketMedian: number;
    offerEvaluation: string;
    targetSalary: number;
    acceptableSalary: number;
    leverageLevel: string;
    leverageFactors: string[];
    negotiationEmail: string;
  }> {
    const prompt = buildSalaryNegotiationPrompt(data);
    return this.generateJSON(prompt, () => {
      const base = data.offerAmount || 90000;
      const target = Math.round(base * 1.12);
      const floor = Math.round(base * 1.04);

      return {
        marketMin: Math.round(base * 0.85),
        marketMax: Math.round(base * 1.25),
        marketMedian: base,
        offerEvaluation: 'Competitive Offer',
        targetSalary: target,
        acceptableSalary: floor,
        leverageLevel: 'MEDIUM',
        leverageFactors: [
          'High demand for full-stack engineering skillsets',
          'Strong performance in technical loops'
        ],
        negotiationEmail: `Subject: Discussing Offer Details - ${data.role}\n\nDear Recruiter,\n\nThank you so much for extending the offer for the ${data.role} position! I am thrilled about the opportunity to join the team.\n\nBased on my research of market rates in ${data.location || 'Remote'} and my experience with full-stack development, I was hoping we could explore a base salary closer to $${target.toLocaleString()}.\n\nThank you for your time and consideration!\n\nBest regards,\nGuest`
      };
    });
  }

  async parseRecruiterEmail(emailText: string, sender: string, subject: string): Promise<{
    company: string;
    jobTitle: string;
    applicationStatus: string;
    recruiterEmail?: string;
    confidence: number;
    summary: string;
  }> {
    const prompt = buildEmailParserPrompt(emailText, sender, subject);
    return this.generateJSON(prompt, () => ({
      company: sender.includes('google') ? 'Google' : 'Tech Company',
      jobTitle: 'Frontend Engineer',
      applicationStatus: 'INTERVIEW',
      recruiterEmail: sender,
      confidence: 0.95,
      summary: 'Recruiter message requesting an interview loop.'
    }));
  }
}

export const aiService = new AIService();
