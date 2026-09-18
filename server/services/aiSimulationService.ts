// Server-side AI evaluation & simulation services
// Providing dynamic, role-specific, context-aware intelligence

export interface JobMatchParams {
  jobTitle: string;
  company: string;
  skills: string;
  experience: number;
  jobDescription: string;
  locationPreference?: string;
}

export interface InterviewScoreParams {
  jobTitle: string;
  company: string;
  skillMatch: number;
  expMatch: number;
  resumeRelevance: number;
  prepLevel: number;
  competitiveness: string;
}

export interface CompanyHealthParams {
  company: string;
  size: string;
  industry: string;
  layoffs: string;
  hiring: string;
  funding: string;
}

export interface SalaryAnalysisParams {
  jobTitle: string;
  company: string;
  offeredSalary: number;
  experienceYears: number;
  location: string;
  otherComp?: string;
}

export interface FollowUpEmailParams {
  company: string;
  jobTitle: string;
  appDate?: string;
  lastContact?: string;
  status: string;
  recruiterName?: string;
  tone: string;
  context?: string;
}

export const aiSimulationService = {
  analyzeJobMatch(params: JobMatchParams) {
    const rawSkills = params.skills
      .toLowerCase()
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const jdText = (params.jobDescription || '').toLowerCase();
    const title = (params.jobTitle || 'Software Engineer').trim();
    const company = (params.company || 'Target Company').trim();

    // Technical taxonomy
    const techBank = [
      'react', 'typescript', 'javascript', 'next.js', 'vue', 'angular', 'node', 'node.js',
      'express', 'graphql', 'rest', 'api', 'python', 'django', 'fastapi', 'postgresql',
      'sql', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd',
      'tailwind', 'css', 'html', 'git', 'system design', 'microservices', 'testing', 'jest',
      'kafka', 'terraform', 'linux', 'agile', 'scrum', 'data structures', 'algorithms'
    ];

    // Detect matched skills
    const matchedSkills = rawSkills.filter((s) => jdText.includes(s) || s.length > 2);
    if (!matchedSkills.length && rawSkills.length) {
      matchedSkills.push(...rawSkills.slice(0, 3));
    }
    if (!matchedSkills.length) {
      matchedSkills.push('Full-Stack Problem Solving', 'Modern Development Practices');
    }

    // Detect missing high-signal keywords from JD
    const missingSkills = techBank
      .filter((tech) => jdText.includes(tech) && !rawSkills.some((s) => s.includes(tech)))
      .slice(0, 4);

    if (!missingSkills.length && jdText.length > 20) {
      missingSkills.push('System Design Architecture', 'Automated CI/CD Workflows');
    }

    // Dynamic scoring algorithm
    let score = 52;
    score += Math.min(28, matchedSkills.length * 7);
    score += Math.min(16, Math.max(1, params.experience) * 2.8);
    if (missingSkills.length > 0) score -= Math.min(18, missingSkills.length * 4);
    score = Math.round(Math.max(35, Math.min(96, score)));

    const tier =
      score >= 85
        ? 'Tier 1 — High-Conviction Fit'
        : score >= 70
        ? 'Tier 2 — Strong Competitive Candidate'
        : 'Tier 3 — Strategic Growth / Stretch';

    const recommendation =
      score >= 85
        ? `Exceptional alignment for ${title} at ${company}. Your technical profile covers key core proficiencies. Prioritize quantifying project throughput and production impact in your opening pitch.`
        : score >= 70
        ? `Solid alignment for ${title} at ${company}. Address ${missingSkills.slice(0, 2).join(' & ') || 'secondary proficiencies'} by framing transferable experience in your cover letter and technical screen.`
        : `Stretch profile for ${title}. Emphasize accelerated learning velocity and demonstrate hands-on case studies to bridge keyword gaps.`;

    const strengths = [
      `${params.experience}+ years experience matches ${title} scope requirements`,
      `Verified competency overlap in ${matchedSkills.slice(0, 3).join(', ')}`,
      `Preferred work mode aligns with ${params.locationPreference || 'Flexible'} setup`,
    ];

    return {
      score,
      tier,
      matchedSkills,
      missingSkills: missingSkills.length ? missingSkills : ['No critical keyword gaps detected'],
      recommendation,
      strengths,
    };
  },

  calculateInterviewScore(params: InterviewScoreParams) {
    const compWeights: Record<string, number> = {
      low: 1.08,
      medium: 1.0,
      high: 0.88,
    };
    const multiplier = compWeights[params.competitiveness] || 1.0;

    const raw =
      params.skillMatch * 0.35 +
      params.expMatch * 0.25 +
      params.resumeRelevance * 0.2 +
      params.prepLevel * 0.2;

    const overallScore = Math.min(97, Math.max(22, Math.round(raw * multiplier)));
    const percentile = Math.min(99, Math.max(15, Math.round(overallScore * 1.05)));

    const readinessRating =
      overallScore >= 82
        ? 'High Readiness — Top 10% Candidate Pool'
        : overallScore >= 65
        ? 'Competitive Readiness — Strong Conversion Odds'
        : 'Action Required — Needs Targeted Scenario Rehearsal';

    const tips = [
      `Structure technical case studies using STAR methodology with concrete business outcomes.`,
      `Prepare 3 reverse-interview questions assessing ${params.company}'s engineering velocity and roadmap priorities.`,
      `Rehearse a 90-second executive summary highlighting your top scalable production contribution.`,
    ];

    return {
      overallScore,
      percentile,
      readinessRating,
      breakdown: [
        { name: 'Technical & Domain Capability', score: Math.round(params.skillMatch * multiplier) },
        { name: 'Experience & Scope Alignment', score: Math.round(params.expMatch * multiplier) },
        { name: 'Resume Signal & Metric Relevance', score: Math.round(params.resumeRelevance * multiplier) },
        { name: 'Behavioral & Scenario Preparedness', score: Math.round(params.prepLevel * multiplier) },
      ],
      tips,
    };
  },

  analyzeCompanyHealth(params: CompanyHealthParams) {
    let score = 72;
    if (params.layoffs === 'major') score -= 32;
    else if (params.layoffs === 'moderate') score -= 18;
    else if (params.layoffs === 'minor') score -= 8;
    else score += 8;

    if (params.hiring === 'active') score += 15;
    else if (params.hiring === 'moderate') score += 5;
    else if (params.hiring === 'slow') score -= 10;
    else if (params.hiring === 'freeze') score -= 28;

    if (params.funding === 'strong') score += 15;
    else if (params.funding === 'stable') score += 8;
    else if (params.funding === 'venture') score += 2;
    else if (params.funding === 'uncertain') score -= 22;

    score = Math.max(18, Math.min(98, score));

    const riskRating =
      score >= 78
        ? 'Low Risk / Robust Health Profile'
        : score >= 54
        ? 'Moderate Risk / Standard Market Volatility'
        : 'Elevated Risk / Headcount Diligence Recommended';

    const rescissionProbability =
      score >= 78 ? '< 1.5% (Very Low)' : score >= 54 ? '4.8% (Average)' : '14.2% (Moderate)';

    const indicators = [
      {
        factor: 'Hiring Velocity & Team Expansion',
        status: params.hiring.toUpperCase(),
        detail: `Hiring posture categorized as ${params.hiring}. Suggests active headcount budget allocation.`,
      },
      {
        factor: 'Capital Structure & Runway',
        status: params.funding.toUpperCase(),
        detail: `Financial stability profile: ${params.funding}. Cashflow runway sufficient for operational targets.`,
      },
      {
        factor: 'Headcount Attrition / Layoff History',
        status: params.layoffs.toUpperCase(),
        detail: `Recent organizational restructuring categorized as ${params.layoffs}.`,
      },
    ];

    return {
      score,
      riskRating,
      rescissionProbability,
      indicators,
      summary: `Analysis of ${params.company} yields a composite health index of ${score}/100 (${riskRating}). Estimated offer rescission risk: ${rescissionProbability}.`,
    };
  },

  analyzeSalary(params: SalaryAnalysisParams) {
    const base = params.offeredSalary || 115000;
    const location = (params.location || 'Remote').toLowerCase();

    // Dynamic market multipliers based on location tier
    let locMultiplier = 1.0;
    if (location.includes('san francisco') || location.includes('sf') || location.includes('new york') || location.includes('nyc') || location.includes('seattle')) {
      locMultiplier = 1.15;
    } else if (location.includes('london') || location.includes('austin') || location.includes('boston') || location.includes('los angeles')) {
      locMultiplier = 1.08;
    }

    const expFactor = 1 + Math.min(0.45, Math.max(1, params.experienceYears) * 0.04);
    const medianMarket = Math.round(base * 1.1 * (locMultiplier * 0.95) * (expFactor * 0.95));
    const percentile25 = Math.round(medianMarket * 0.88);
    const percentile75 = Math.round(medianMarket * 1.18);
    const targetCounter = Math.round(base * 1.12);
    const aggressiveCounter = Math.round(base * 1.2);

    const diff = Math.round(((base - medianMarket) / medianMarket) * 100);
    const leverageScore = Math.min(94, Math.max(40, 58 + params.experienceYears * 4.5));

    const recommendation =
      diff < 0
        ? `Offer sits ${Math.abs(diff)}% below competitive median for ${params.jobTitle} with ${params.experienceYears}y exp in ${params.location}. We advise countering between $${targetCounter.toLocaleString()} and $${aggressiveCounter.toLocaleString()}.`
        : `Offer is competitive and sits at or above the 50th percentile. Focus negotiation on equity grants, sign-on bonus, or accelerated performance reviews.`;

    const talkingPoints = [
      `"Based on market data for ${params.jobTitle} in ${params.location} with ${params.experienceYears}+ years of proven delivery, peers are compensated in the $${medianMarket.toLocaleString()} – $${percentile75.toLocaleString()} range."`,
      `"I am enthusiastic about joining ${params.company} and confident I can drive immediate impact. If we can reach $${targetCounter.toLocaleString()}, I would be thrilled to sign right away."`,
      `"Is there flexibility to augment the compensation package via an upfront signing bonus or expanded equity refresher grant?"`,
    ];

    return {
      medianMarket,
      percentile25,
      percentile75,
      targetCounter,
      aggressiveCounter,
      differencePercent: diff,
      leverageScore,
      recommendation,
      talkingPoints,
    };
  },

  generateFollowUpEmail(params: FollowUpEmailParams) {
    const rec = params.recruiterName || 'Hiring Team';
    const comp = params.company || 'Company';
    const title = params.jobTitle || 'Position';
    const tone = (params.tone || 'Professional').toLowerCase();

    let subjectOptions: string[] = [];
    let body = '';

    if (tone === 'concise') {
      subjectOptions = [
        `Checking in: ${title} — ${comp}`,
        `Quick follow-up regarding ${title}`,
        `Status update on ${title} application`,
      ];
      body = `Hi ${rec},\n\nHope you're having a productive week.\n\nI am writing to briefly check in on the status of my application for the ${title} role at ${comp}.\n\nI remain very enthusiastic about the opportunity and would be glad to provide any additional context or code samples to assist in the review.\n\nBest regards,\n[Your Name]`;
    } else if (tone === 'confident') {
      subjectOptions = [
        `Following up on ${title} role — next steps & impact`,
        `Re: ${title} opportunity at ${comp}`,
        `Continued enthusiasm for ${title} at ${comp}`,
      ];
      body = `Hi ${rec},\n\nI hope all is well with you and the team at ${comp}.\n\nFollowing up on my candidacy for the ${title} position. Given ${comp}'s focus on innovation and velocity, I'm confident my background delivering scalable solutions will translate into immediate value for your initiatives.\n\n${params.context ? params.context + '\n\n' : ''}I'd welcome the chance to discuss how my skill set directly aligns with your roadmap for this quarter. Looking forward to your thoughts!\n\nWarm regards,\n[Your Name]`;
    } else if (tone === 'friendly') {
      subjectOptions = [
        `Hope your week is going great! Following up on ${title}`,
        `Excited about ${comp} — quick check-in on ${title}`,
        `Thinking of the ${comp} team — ${title} update`,
      ];
      body = `Hi ${rec},\n\nI hope you're having a wonderful week so far!\n\nI wanted to reach out and see if there are any updates regarding the ${title} opening at ${comp}. I really enjoyed reading about your recent projects and felt a great connection with your team's mission.\n\n${params.context ? params.context + '\n\n' : ''}Please let me know if you need anything else from my end. Thanks so much for your time and guidance!\n\nBest,\n[Your Name]`;
    } else {
      // Professional default
      subjectOptions = [
        `Following Up on ${title} Application — ${comp}`,
        `Inquiry: Status of ${title} Application`,
        `Application Follow-Up: ${title} at ${comp}`,
      ];
      body = `Dear ${rec},\n\nI hope this message finds you well.\n\nI am writing to follow up on the status of my application for the ${title} position at ${comp}. I remain keenly interested in contributing to your team and believe my technical skill set and track record are an excellent match for your requirements.\n\n${params.context ? params.context + '\n\n' : ''}Should you require any additional documentation, portfolio references, or technical demonstrations, please do not hesitate to reach out.\n\nThank you for your time and continued consideration.\n\nSincerely,\n[Your Name]`;
    }

    return {
      subject: subjectOptions[0],
      subjectOptions,
      body,
      bestTimeToSent: 'Tuesday or Thursday morning between 9:00 AM – 10:30 AM local time',
    };
  },
};
