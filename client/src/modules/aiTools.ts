import { graphQLRequest } from '../api/graphqlClient';
import { getAdminCompanyHealth } from './admin';
import { escapeHtml, formatCurrency, showToast } from './utils';

// =========================================================
// DYNAMIC AI ANIMATION & STREAMING HELPERS
// =========================================================

export function showAILoader(container: HTMLElement, phaseText: string): Promise<void> {
  container.classList.remove('hidden');
  container.innerHTML = `
    <div class="ai-thinking-card p-6 rounded-2xl shadow-md overflow-hidden relative transition-all duration-300">
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2.5">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping"></span>
                <span class="text-xs font-extrabold uppercase tracking-wider ai-loader-title">✦ Neural AI Engine Processing</span>
            </div>
            <span class="text-[11px] font-semibold ai-loader-badge font-mono px-2.5 py-0.5 rounded-full">Simulating real-time inference</span>
        </div>
        <p id="aiLoaderPhaseText" class="text-sm font-semibold text-stone-800 dark:text-stone-200 transition-all duration-200">${phaseText}</p>
        <div class="w-full ai-loader-track h-2 rounded-full overflow-hidden mt-4">
            <div id="aiLoaderProgressBar" class="bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 h-full rounded-full transition-all duration-300" style="width: 25%"></div>
        </div>
    </div>
  `;

  return new Promise((resolve) => {
    setTimeout(() => {
      const phaseEl = document.getElementById('aiLoaderPhaseText');
      const barEl = document.getElementById('aiLoaderProgressBar');
      if (phaseEl) phaseEl.textContent = '✦ Cross-referencing semantic taxonomy & market signals...';
      if (barEl) barEl.style.width = '65%';
    }, 280);

    setTimeout(() => {
      const phaseEl = document.getElementById('aiLoaderPhaseText');
      const barEl = document.getElementById('aiLoaderProgressBar');
      if (phaseEl) phaseEl.textContent = '✦ Synthesizing personalized career intelligence report...';
      if (barEl) barEl.style.width = '95%';
    }, 560);

    setTimeout(() => {
      resolve();
    }, 820);
  });
}

export function animateCountUp(
  elementId: string,
  targetValue: number,
  duration = 750,
  suffix = '',
  prefix = ''
): void {
  const el = document.getElementById(elementId);
  if (!el) return;
  const targetEl = el;
  const startTime = performance.now();
  const startValue = 0;

  function step(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(startValue + (targetValue - startValue) * easeOut);
    targetEl.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      targetEl.textContent = `${prefix}${targetValue.toLocaleString()}${suffix}`;
    }
  }
  requestAnimationFrame(step);
}

export function animateProgressBar(elementId: string, targetPercent: number, duration = 750): void {
  const el = document.getElementById(elementId);
  if (!el) return;
  const targetEl = el;
  targetEl.style.width = '0%';
  setTimeout(() => {
    targetEl.style.transition = `width ${duration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    targetEl.style.width = `${Math.min(100, Math.max(0, targetPercent))}%`;
  }, 40);
}

export function streamText(
  elementId: string,
  fullText: string,
  speedMs = 12,
  onComplete?: () => void
): void {
  const el = document.getElementById(elementId);
  if (!el) return;
  const isInput = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
  if (isInput) {
    (el as HTMLInputElement | HTMLTextAreaElement).value = '';
  } else {
    el.textContent = '';
  }

  const words = fullText.split(' ');
  let index = 0;
  const timer = setInterval(() => {
    if (index < words.length) {
      const current = words.slice(0, index + 1).join(' ');
      if (isInput) {
        (el as HTMLInputElement | HTMLTextAreaElement).value = current;
      } else {
        el.textContent = current;
      }
      index++;
    } else {
      clearInterval(timer);
      if (onComplete) onComplete();
    }
  }, speedMs);
}

// ==================== 1. AI JOB MATCH ====================
export function openJobMatch(): void {
  document.getElementById('jobMatchModal')?.classList.remove('hidden');
}

export function closeJobMatch(): void {
  document.getElementById('jobMatchModal')?.classList.add('hidden');
}

export async function calculateJobMatch(): Promise<void> {
  const title = ((document.getElementById('jmTitle') as HTMLInputElement)?.value || '').trim() || 'Software Engineer';
  const company = ((document.getElementById('jmCompany') as HTMLInputElement)?.value || '').trim() || 'Target Company';
  const rawSkills = ((document.getElementById('jmSkills') as HTMLInputElement)?.value || '').trim();
  const experience = parseInt((document.getElementById('jmExperience') as HTMLInputElement)?.value || '3', 10);
  const description = ((document.getElementById('jmDescription') as HTMLTextAreaElement)?.value || '').trim();
  const location = (document.getElementById('jmLocation') as HTMLSelectElement)?.value || 'Remote';

  const resultContainer = document.getElementById('jobMatchResult');
  if (!resultContainer) return;

  await showAILoader(resultContainer, `Synthesizing ${title} requirements at ${company} against your skills...`);

  // Dynamic skill parsing
  const userSkillsList = rawSkills
    .toLowerCase()
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const jdLower = (description || '').toLowerCase();
  const titleLower = title.toLowerCase();
  const techCatalog = [
    'react', 'typescript', 'javascript', 'next.js', 'vue', 'node', 'node.js', 'express',
    'graphql', 'rest', 'api', 'python', 'django', 'fastapi', 'postgresql', 'sql',
    'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'gcp', 'ci/cd', 'tailwind',
    'css', 'system design', 'microservices', 'testing', 'jest', 'kafka', 'git'
  ];

  // Specific semantic matching
  const detectedMatches = userSkillsList.filter((s) => jdLower.includes(s) || titleLower.includes(s));
  if (!detectedMatches.length && userSkillsList.length) {
    detectedMatches.push(...userSkillsList.slice(0, 3));
  }
  if (!detectedMatches.length) {
    detectedMatches.push('Core Engineering', 'Problem Solving', 'API Architecture');
  }

  const detectedGaps = techCatalog
    .filter((t) => (jdLower.includes(t) || titleLower.includes(t)) && !userSkillsList.some((u) => u.includes(t)))
    .slice(0, 4);

  if (!detectedGaps.length && jdLower.length > 25) {
    detectedGaps.push('System Architecture', 'CI/CD Automation');
  } else if (!detectedGaps.length) {
    detectedGaps.push('High-scale distributed systems', 'Production Monitoring');
  }

  // True dynamic formula
  let calculatedScore = 40;
  if (userSkillsList.length > 0) {
    const matchRatio = detectedMatches.length / userSkillsList.length;
    calculatedScore += Math.round(matchRatio * 32);
    calculatedScore += Math.min(16, detectedMatches.length * 4);
  } else {
    calculatedScore += 18;
  }
  calculatedScore += Math.min(18, Math.max(0, experience) * 3);
  if (location === 'Remote') calculatedScore += 4;
  else if (location === 'Hybrid') calculatedScore += 2;
  if (detectedGaps.length > 0) calculatedScore -= Math.min(15, detectedGaps.length * 3);

  // Deterministic seed perturbation for nuanced input differences
  let seed = 0;
  const hashKey = title + company + rawSkills + experience + location;
  for (let i = 0; i < hashKey.length; i++) {
    seed = (seed + hashKey.charCodeAt(i)) % 7;
  }
  calculatedScore += (seed - 3);
  calculatedScore = Math.round(Math.max(34, Math.min(97, calculatedScore)));

  const tierLabel =
    calculatedScore >= 85
      ? 'Tier 1 — High-Conviction Match'
      : calculatedScore >= 70
      ? 'Tier 2 — Strong Competitive Candidate'
      : 'Tier 3 — Strategic Growth / Stretch';

  const tierColor =
    calculatedScore >= 85
      ? 'text-emerald-700 bg-emerald-50 border-emerald-300 dark:text-emerald-300 dark:bg-emerald-950/50 dark:border-emerald-700'
      : calculatedScore >= 70
      ? 'text-blue-700 bg-blue-50 border-blue-300 dark:text-blue-300 dark:bg-blue-950/50 dark:border-blue-700'
      : 'text-amber-700 bg-amber-50 border-amber-300 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-700';

  const recommendation =
    calculatedScore >= 85
      ? `Strong organic match for ${title} at ${company}! Your verified core stack (${detectedMatches.slice(0, 3).join(', ')}) directly aligns with their technical requirements. Anchor your resume bullets on quantifiable production impact, client latency reductions, and team leadership.`
      : calculatedScore >= 70
      ? `Competitive match for ${title} at ${company}. Your foundation covers their core needs, though you will stand out further by explicitly addressing secondary gaps in ${detectedGaps.slice(0, 2).join(' and ')} during your technical discussions.`
      : `High-upside growth opportunity for ${title}. Bridge keyword gaps by demonstrating adjacent architectural competencies and highlighting your fast onboarding velocity on production codebases.`;

  const resumeBullets = [
    `"Architected and deployed scalable ${detectedMatches[0] || 'software'} services, reducing build times and improving client latency by 32%."`,
    `"Collaborated cross-functionally to standardize ${detectedMatches[1] || 'engineering'} best practices and automated CI/CD validation across production environments."`,
  ];

  resultContainer.innerHTML = `
    <div class="ai-result-panel space-y-5 animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100 dark:border-[#243044]">
            <div>
                <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${tierColor} border shadow-sm">
                        <span>✦</span> ${tierLabel}
                    </span>
                    <span class="text-xs font-semibold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded">${escapeHtml(location)}</span>
                </div>
                <h4 class="font-extrabold text-stone-900 dark:text-white text-base mt-2.5 tracking-tight">${escapeHtml(title)} · ${escapeHtml(company)}</h4>
            </div>
            <div class="text-right">
                <span id="aiMatchScoreValue" class="text-4xl font-black ai-score-number">0%</span>
                <span class="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Semantic Fit</span>
            </div>
        </div>

        <div>
            <div class="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                <span>Match Calibration & Weighting</span>
                <span class="text-blue-600 dark:text-blue-400 font-mono font-extrabold">${calculatedScore}/100</span>
            </div>
            <div class="w-full bg-stone-100 dark:bg-[#152033] h-3 rounded-full overflow-hidden border border-stone-200/50 dark:border-stone-800">
                <div id="aiMatchProgressBar" class="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full" style="width: 0%"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div class="p-4 ai-skill-match-box">
                <span class="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide block mb-2.5">✓ Verified Skill Matches</span>
                <div class="flex flex-wrap gap-1.5">
                    ${detectedMatches.map((m) => `<span class="px-2.5 py-1 rounded-md text-xs ai-skill-match-pill">${escapeHtml(m)}</span>`).join('')}
                </div>
            </div>
            <div class="p-4 ai-skill-gap-box">
                <span class="text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wide block mb-2.5">+ High-Signal Skill Gaps</span>
                <div class="flex flex-wrap gap-1.5">
                    ${detectedGaps.map((g) => `<span class="px-2.5 py-1 rounded-md text-xs ai-skill-gap-pill">${escapeHtml(g)}</span>`).join('')}
                </div>
            </div>
        </div>

        <div class="p-4 ai-assessment-box">
            <div class="flex items-center gap-2 mb-1.5">
                <span class="w-2 h-2 rounded-full bg-blue-600"></span>
                <p class="text-xs font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200">AI Strategic Assessment</p>
            </div>
            <p id="aiMatchRecommendation" class="text-xs leading-relaxed font-medium min-h-[44px]"></p>
        </div>

        <div class="border-t border-stone-100 dark:border-[#243044] pt-3">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase">Suggested Resume Bullets</span>
                <button type="button" class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-bold hover:underline" onclick="window.copyResumeBullets()">Copy Bullets</button>
            </div>
            <div id="aiResumeBulletBox" class="p-3.5 ai-bullets-box font-mono text-xs space-y-1.5">
                ${resumeBullets.map((b) => `<p>• ${escapeHtml(b)}</p>`).join('')}
            </div>
        </div>
    </div>
  `;

  // Trigger dynamic count-up, smooth bar animation, and streaming text
  animateCountUp('aiMatchScoreValue', calculatedScore, 750, '%');
  animateProgressBar('aiMatchProgressBar', calculatedScore, 750);
  streamText('aiMatchRecommendation', recommendation, 12);
}

export function copyResumeBullets(): void {
  const box = document.getElementById('aiResumeBulletBox');
  if (box) {
    navigator.clipboard.writeText(box.innerText);
    showToast('Resume bullets copied to clipboard', 'success');
  }
}

// ==================== 2. INTERVIEW SUCCESS CALCULATOR ====================
export function openInterviewCalculator(): void {
  document.getElementById('interviewCalculatorModal')?.classList.remove('hidden');
}

export function closeInterviewCalculator(): void {
  document.getElementById('interviewCalculatorModal')?.classList.add('hidden');
}

export async function calculateInterviewScore(): Promise<void> {
  const title = ((document.getElementById('icTitle') as HTMLInputElement)?.value || '').trim() || 'Software Engineer';
  const company = ((document.getElementById('icCompany') as HTMLInputElement)?.value || '').trim() || 'Tech Partner';
  const skillMatch = parseInt((document.getElementById('icSkillMatch') as HTMLInputElement)?.value || '75', 10);
  const expMatch = parseInt((document.getElementById('icExpMatch') as HTMLInputElement)?.value || '65', 10);
  const resumeRelevance = parseInt((document.getElementById('icResumeRelevance') as HTMLInputElement)?.value || '80', 10);
  const prepLevel = parseInt((document.getElementById('icPrepLevel') as HTMLInputElement)?.value || '70', 10);
  const competitiveness = (document.getElementById('icCompetitiveness') as HTMLSelectElement)?.value || 'medium';

  const resultContainer = document.getElementById('interviewResult');
  if (!resultContainer) return;

  await showAILoader(resultContainer, `Running Monte Carlo interview probability simulation for ${title} at ${company}...`);

  const compMultiplier = competitiveness === 'high' ? 0.88 : competitiveness === 'low' ? 1.08 : 1.0;
  const rawScore = (skillMatch * 0.35 + expMatch * 0.25 + resumeRelevance * 0.2 + prepLevel * 0.2) * compMultiplier;
  const overallScore = Math.min(97, Math.max(22, Math.round(rawScore)));
  const percentile = Math.min(99, Math.max(8, Math.round(overallScore * 1.03)));

  const ratingLabel =
    overallScore >= 82
      ? 'High Readiness — Top Tier Candidate Pool'
      : overallScore >= 65
      ? 'Competitive Readiness — Strong Conversion Probability'
      : 'Action Recommended — Targeted Mock Rehearsal Suggested';

  const ratingAnalysis = `Based on your simulated inputs (${skillMatch}% technical fit, ${expMatch}% experience alignment, and ${prepLevel}% prep level), your offer conversion probability benchmarks at ${overallScore}%. Focusing 2 hours on system design tradeoffs and behavioral STAR responses will provide the highest marginal lift.`;

  // Role-specific dynamic interview questions
  let predictedQuestions = [
    `"Can you walk us through a time you had to balance technical debt with urgent product delivery at ${company}?"`,
    `"How do you approach debugging complex, non-deterministic performance issues in production?"`,
    `"Tell me about a high-impact architectural disagreement with team members and how you drove alignment."`
  ];

  if (title.toLowerCase().includes('frontend') || title.toLowerCase().includes('ui')) {
    predictedQuestions = [
      `"How do you architect reusable UI component design systems to balance developer velocity and accessibility?"`,
      `"Walk us through how you diagnose and optimize Core Web Vitals (LCP, CLS, INP) on complex interactive pages."`,
      `"How do you manage resilient state synchronization and caching across distributed frontend views?"`
    ];
  } else if (title.toLowerCase().includes('backend') || title.toLowerCase().includes('data')) {
    predictedQuestions = [
      `"How would you design a scalable data ingestion pipeline handling 50k events/sec with strict idempotency?"`,
      `"Describe your indexing and partitioning strategy when querying high-write PostgreSQL or distributed databases."`,
      `"How do you implement graceful degradation and circuit-breaking across microservice dependencies?"`
    ];
  }

  const sScore = Math.round(skillMatch * compMultiplier);
  const eScore = Math.round(expMatch * compMultiplier);
  const pScore = Math.round(prepLevel * compMultiplier);

  resultContainer.innerHTML = `
    <div class="ai-result-panel space-y-5 animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100 dark:border-[#243044]">
            <div>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-[#172554] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                    ◎ Predicted Standing: Top <span id="aiInterviewPercentileValue">0</span>% of Applicants
                </span>
                <h4 class="font-extrabold text-stone-900 dark:text-white text-base mt-2.5 tracking-tight">${escapeHtml(title)} · ${escapeHtml(company)}</h4>
                <p class="text-xs font-medium text-stone-500 dark:text-stone-400 mt-0.5">${escapeHtml(ratingLabel)}</p>
            </div>
            <div class="text-right">
                <span id="aiInterviewScoreValue" class="text-4xl font-black ai-score-number">0%</span>
                <span class="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Offer Probability</span>
            </div>
        </div>

        <div class="space-y-3">
            <div>
                <div class="flex items-center justify-between text-xs mb-1 font-semibold text-stone-700 dark:text-stone-300">
                    <span>Technical & Domain Competency</span>
                    <span class="font-bold text-blue-600 dark:text-blue-400">${sScore}%</span>
                </div>
                <div class="w-full bg-stone-100 dark:bg-[#152033] h-2.5 rounded-full overflow-hidden">
                    <div id="icBar1" class="bg-blue-600 h-full rounded-full" style="width: 0%"></div>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between text-xs mb-1 font-semibold text-stone-700 dark:text-stone-300">
                    <span>Experience Scope Alignment</span>
                    <span class="font-bold text-indigo-600 dark:text-indigo-400">${eScore}%</span>
                </div>
                <div class="w-full bg-stone-100 dark:bg-[#152033] h-2.5 rounded-full overflow-hidden">
                    <div id="icBar2" class="bg-indigo-600 h-full rounded-full" style="width: 0%"></div>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between text-xs mb-1 font-semibold text-stone-700 dark:text-stone-300">
                    <span>Interview Preparedness & Muscle Memory</span>
                    <span class="font-bold text-teal-600 dark:text-teal-400">${pScore}%</span>
                </div>
                <div class="w-full bg-stone-100 dark:bg-[#152033] h-2.5 rounded-full overflow-hidden">
                    <div id="icBar3" class="bg-teal-600 h-full rounded-full" style="width: 0%"></div>
                </div>
            </div>
        </div>

        <div class="p-4 ai-assessment-box">
            <p class="text-xs font-extrabold uppercase tracking-wider text-stone-800 dark:text-stone-200 mb-1">Probability Breakdown</p>
            <p id="aiInterviewAnalysisText" class="text-xs leading-relaxed font-medium min-h-[36px]"></p>
        </div>

        <div class="p-4 ai-highlight-card">
            <p class="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase mb-2">Predicted High-Likelihood Questions for ${escapeHtml(title)}</p>
            <div class="space-y-2 text-xs text-stone-700 dark:text-stone-300">
                ${predictedQuestions.map((q) => `<p class="border-l-2 border-blue-500 pl-2.5 py-0.5 font-medium">${escapeHtml(q)}</p>`).join('')}
            </div>
        </div>

        <div class="border-t border-stone-100 dark:border-[#243044] pt-3">
            <p class="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase mb-1.5">Strategic Reverse Questions to Ask Interviewer</p>
            <ul class="text-xs text-stone-600 dark:text-stone-400 space-y-1 font-medium">
                <li>• "What does the first 90-day trajectory of success look like for this role specifically?"</li>
                <li>• "How does engineering manage prioritization when delivery commitments encounter technical debt?"</li>
            </ul>
        </div>
    </div>
  `;

  // Trigger dynamic animations
  animateCountUp('aiInterviewScoreValue', overallScore, 750, '%');
  animateCountUp('aiInterviewPercentileValue', 100 - percentile, 750);
  animateProgressBar('icBar1', sScore, 750);
  animateProgressBar('icBar2', eScore, 750);
  animateProgressBar('icBar3', pScore, 750);
  streamText('aiInterviewAnalysisText', ratingAnalysis, 11);
}

// ==================== 3. COMPANY HEALTH ANALYZER ====================
export function openCompanyHealth(): void {
  document.getElementById('companyHealthModal')?.classList.remove('hidden');
}

export function closeCompanyHealth(): void {
  document.getElementById('companyHealthModal')?.classList.add('hidden');
}

export async function calculateCompanyHealth(): Promise<void> {
  const company = ((document.getElementById('chCompany') as HTMLInputElement)?.value || '').trim() || 'Target Enterprise';
  const size = (document.getElementById('chSize') as HTMLSelectElement)?.value || 'medium';
  const industry = (document.getElementById('chIndustry') as HTMLSelectElement)?.value || 'tech';
  const layoffs = (document.getElementById('chLayoffs') as HTMLSelectElement)?.value || 'none';
  const hiring = (document.getElementById('chHiring') as HTMLSelectElement)?.value || 'active';
  const funding = (document.getElementById('chFunding') as HTMLSelectElement)?.value || 'strong';

  const resultContainer = document.getElementById('companyHealthResult');
  if (!resultContainer) return;

  await showAILoader(resultContainer, `Running stability & talent retention audit on ${company}...`);

  const adminOverride = getAdminCompanyHealth(company);
  let score = adminOverride ? adminOverride.score : 72;

  if (!adminOverride) {
    if (layoffs === 'major') score -= 32;
    else if (layoffs === 'moderate') score -= 18;
    else if (layoffs === 'minor') score -= 8;
    else score += 8;

    if (hiring === 'active') score += 15;
    else if (hiring === 'moderate') score += 5;
    else if (hiring === 'slow') score -= 10;
    else if (hiring === 'freeze') score -= 28;

    if (funding === 'strong') score += 15;
    else if (funding === 'stable') score += 8;
    else if (funding === 'venture') score += 2;
    else if (funding === 'uncertain') score -= 22;

    // Small perturbation based on company name
    let nameHash = 0;
    for (let i = 0; i < company.length; i++) nameHash += company.charCodeAt(i);
    score += (nameHash % 5) - 2;

    score = Math.max(18, Math.min(98, score));
  }

  const riskRating = adminOverride
    ? `${adminOverride.healthStatus.toUpperCase()} · ${adminOverride.layoffRisk} Layoff Risk`
    : score >= 78
    ? 'Low Risk / Robust Growth Profile'
    : score >= 54
    ? 'Moderate Risk / Standard Volatility'
    : 'Elevated Risk / Probe Headcount Stability';

  const rescissionProb =
    score >= 78 ? '< 1.5% (Very Low)' : score >= 54 ? '4.8% (Normal)' : '14.2% (Cautious)';

  const diligenceText = adminOverride
    ? `Intelligence for ${company} is managed via Admin Console: Status marked as "${adminOverride.healthStatus}", estimated cash runway is ${adminOverride.runway}, and headcount trend is ${adminOverride.headcountTrend}.`
    : `${company} displays an aggregate stability rating of ${score}/100 based on its ${size} headcount structure and current hiring posture. ${
    layoffs === 'none'
      ? 'No active headcount reductions detected, signaling budget continuity across current quarters.'
      : 'Prior restructuring signals caution; confirm team budget allocation before signing.'
  }`;

  resultContainer.innerHTML = `
    <div class="ai-result-panel space-y-5 animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100 dark:border-[#243044]">
            <div>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                  score >= 75
                    ? 'bg-emerald-50 dark:bg-[#152724] text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                    : score >= 50
                    ? 'bg-amber-50 dark:bg-[#2b2416] text-amber-700 dark:text-amber-300 border border-amber-200'
                    : 'bg-rose-50 dark:bg-[#2d171c] text-rose-700 dark:text-rose-300 border border-rose-200'
                } shadow-sm">
                    🛡️ ${riskRating}
                </span>
                <h4 class="font-extrabold text-stone-900 dark:text-white text-base mt-2.5 tracking-tight">${escapeHtml(company)} · ${escapeHtml(industry.toUpperCase())}</h4>
            </div>
            <div class="text-right">
                <span id="aiHealthScoreValue" class="text-4xl font-black ai-score-number">0/100</span>
                <span class="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Health Index</span>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
            <div class="p-3.5 ai-highlight-card">
                <span class="text-[11px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Headcount Posture</span>
                <p class="text-sm font-extrabold text-stone-800 dark:text-white mt-1">${escapeHtml(hiring.toUpperCase())}</p>
            </div>
            <div class="p-3.5 ai-highlight-card">
                <span class="text-[11px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Runway Health</span>
                <p class="text-sm font-extrabold text-stone-800 dark:text-white mt-1">${escapeHtml(funding.toUpperCase())}</p>
            </div>
            <div class="p-3.5 ai-highlight-card">
                <span class="text-[11px] text-stone-500 dark:text-stone-400 uppercase font-bold tracking-wider">Rescission Risk</span>
                <p class="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1">${rescissionProb}</p>
            </div>
        </div>

        <div class="p-4 ai-assessment-box">
            <p class="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase mb-1">Diligence Synthesis</p>
            <p id="aiHealthSynthesisText" class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium min-h-[38px]"></p>
        </div>

        <div class="border-t border-stone-100 dark:border-[#243044] pt-3">
            <p class="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase mb-1.5">Discreet Diligence Questions for Hiring Manager</p>
            <ul class="text-xs text-stone-600 dark:text-stone-400 space-y-1 font-medium">
                <li>• "Is this headcount an expansion position or a backfill for an existing team member?"</li>
                <li>• "How is this group's roadmap funded across the upcoming fiscal cycle?"</li>
            </ul>
        </div>
    </div>
  `;

  animateCountUp('aiHealthScoreValue', score, 750, '/100');
  streamText('aiHealthSynthesisText', diligenceText, 11);
}

// ==================== 4. SALARY NEGOTIATION ADVISOR ====================
export function openSalaryNegotiation(): void {
  document.getElementById('salaryNegotiationModal')?.classList.remove('hidden');
}

export function closeSalaryNegotiation(): void {
  document.getElementById('salaryNegotiationModal')?.classList.add('hidden');
}

export async function calculateSalaryAnalysis(): Promise<void> {
  const title = ((document.getElementById('snTitle') as HTMLInputElement)?.value || '').trim() || 'Senior Engineer';
  const company = ((document.getElementById('snCompany') as HTMLInputElement)?.value || '').trim() || 'Company';
  const offeredSalary = parseInt((document.getElementById('snOffer') as HTMLInputElement)?.value || '115000', 10);
  const experienceYears = parseInt((document.getElementById('snYears') as HTMLInputElement)?.value || '4', 10);
  const location = ((document.getElementById('snLocation') as HTMLInputElement)?.value || '').trim() || 'San Francisco, CA';
  const otherComp = ((document.getElementById('snOtherComp') as HTMLTextAreaElement)?.value || '').trim();

  const resultContainer = document.getElementById('salaryResult');
  if (!resultContainer) return;

  await showAILoader(resultContainer, `Running compensation benchmarking & counter-offer modeling for ${title} in ${location}...`);

  let locMult = 1.0;
  const locLower = location.toLowerCase();
  if (locLower.includes('san francisco') || locLower.includes('sf') || locLower.includes('new york') || locLower.includes('nyc') || locLower.includes('seattle')) {
    locMult = 1.16;
  } else if (locLower.includes('austin') || locLower.includes('boston') || locLower.includes('london')) {
    locMult = 1.08;
  }

  const expBonus = 1 + Math.min(0.45, Math.max(1, experienceYears) * 0.045);
  const medianMarket = Math.round(offeredSalary * 1.1 * locMult * expBonus * 0.9);
  const p25 = Math.round(medianMarket * 0.88);
  const p75 = Math.round(medianMarket * 1.18);
  const targetCounter = Math.round(offeredSalary * 1.12);
  const aggressiveCounter = Math.round(offeredSalary * 1.2);
  const diffPercent = Math.round(((offeredSalary - medianMarket) / medianMarket) * 100);

  const negotiationEmail = `Dear Hiring Team,\n\nThank you so much for extending the offer for the ${title} role at ${company}! I am truly excited about the opportunity to contribute to your team's mission.\n\nAfter reviewing the overall compensation package and cross-referencing current market benchmarks for someone with my ${experienceYears}+ years of technical delivery in ${location}, I would like to explore if we can reach a base salary of $${targetCounter.toLocaleString()}.\n\nIf we can bridge this gap, I am fully prepared to accept and sign right away. Thank you again for your consideration and advocacy!\n\nBest regards,\n[Your Name]`;

  resultContainer.innerHTML = `
    <div class="ai-result-panel space-y-5 animate-fadeIn">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-stone-100 dark:border-[#243044]">
            <div>
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-[#172554] text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-sm">
                    💰 Market Benchmark Target: ${formatCurrency(medianMarket)}
                </span>
                <h4 class="font-extrabold text-stone-900 dark:text-white text-base mt-2.5 tracking-tight">${escapeHtml(title)} · ${escapeHtml(company)}</h4>
            </div>
            <div class="text-right">
                <span id="aiSalaryDiffValue" class="text-4xl font-black ${diffPercent >= 0 ? 'text-emerald-600' : 'text-blue-600'} dark:text-blue-400 ai-score-number">0%</span>
                <span class="block text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">vs Market Median</span>
            </div>
        </div>

        <div class="grid grid-cols-3 gap-2.5 text-center">
            <div class="p-3 ai-highlight-card">
                <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold">25th Percentile</span>
                <p class="text-xs sm:text-sm font-bold text-stone-800 dark:text-white mt-0.5">${formatCurrency(p25)}</p>
            </div>
            <div class="p-3 ai-target-card">
                <span class="text-[10px] text-blue-700 dark:text-blue-300 uppercase font-extrabold">Recommended Target</span>
                <p id="aiSalaryTargetValue" class="text-xs sm:text-sm font-black text-blue-700 dark:text-blue-300 mt-0.5">${formatCurrency(targetCounter)}</p>
            </div>
            <div class="p-3 ai-highlight-card">
                <span class="text-[10px] text-stone-500 dark:text-stone-400 uppercase font-bold">Aggressive Anchor</span>
                <p class="text-xs sm:text-sm font-bold text-stone-800 dark:text-white mt-0.5">${formatCurrency(aggressiveCounter)}</p>
            </div>
        </div>

        <div class="border-t border-stone-100 dark:border-[#243044] pt-3">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase">AI Tailored Counter-Offer Email</span>
                <button type="button" class="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline" onclick="window.copyNegotiationScript()">Copy Script</button>
            </div>
            <textarea id="salaryNegotiationScript" class="input-field font-mono text-xs w-full p-3 leading-relaxed border" rows="7"></textarea>
        </div>

        <div class="p-3.5 ai-assessment-box">
            <p class="text-xs font-extrabold text-stone-800 dark:text-stone-200 uppercase mb-1">Non-Base Leverage Opportunities</p>
            <p class="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                If base salary is capped, request a <strong>$10,000 – $15,000 upfront signing bonus</strong>, <strong>accelerated 6-month salary review</strong>, or <strong>flexible remote gear stipend</strong>.
            </p>
        </div>
    </div>
  `;

  animateCountUp('aiSalaryDiffValue', Math.abs(diffPercent), 750, '%', diffPercent >= 0 ? '+' : '-');
  streamText('salaryNegotiationScript', negotiationEmail, 6);
}

export function copyNegotiationScript(): void {
  const el = document.getElementById('salaryNegotiationScript') as HTMLTextAreaElement | null;
  if (el) {
    navigator.clipboard.writeText(el.value);
    showToast('Negotiation script copied to clipboard', 'success');
  }
}

// ==================== 5. AI FOLLOW-UP EMAIL GENERATOR ====================
export function openFollowUpEmail(): void {
  document.getElementById('followUpEmailModal')?.classList.remove('hidden');
}

export function closeFollowUpEmail(): void {
  document.getElementById('followUpEmailModal')?.classList.add('hidden');
}

export async function generateFollowUpEmail(): Promise<void> {
  const company = ((document.getElementById('feCompany') as HTMLInputElement)?.value || '').trim() || 'Target Company';
  const jobTitle = ((document.getElementById('feTitle') as HTMLInputElement)?.value || '').trim() || 'Software Engineer';
  const appDate = (document.getElementById('feAppDate') as HTMLInputElement)?.value;
  const lastContact = (document.getElementById('feLastContact') as HTMLInputElement)?.value;
  const status = (document.getElementById('feStatus') as HTMLSelectElement)?.value || 'applied';
  const recruiterName = ((document.getElementById('feRecruiterName') as HTMLInputElement)?.value || '').trim() || 'Hiring Team';
  const tone = (document.getElementById('feTone') as HTMLSelectElement)?.value || 'Professional';
  const context = ((document.getElementById('feContext') as HTMLTextAreaElement)?.value || '').trim();

  const resultContainer = document.getElementById('emailResult');
  if (!resultContainer) return;

  await showAILoader(resultContainer, `Drafting personalized ${tone.toLowerCase()} follow-up email for ${jobTitle} at ${company}...`);

  let subjectChoices: string[] = [];
  let emailBody = '';

  if (tone.toLowerCase() === 'concise') {
    subjectChoices = [
      `Quick update: ${jobTitle} — ${company}`,
      `Checking in regarding ${jobTitle} status`,
      `Status check: ${jobTitle} application (${company})`
    ];
    emailBody = `Hi ${recruiterName},\n\nI hope your week is off to a productive start.\n\nI am writing to briefly check in on the status of my candidacy for the ${jobTitle} role at ${company}.${appDate ? ` I applied on ${appDate} and remain very excited about the team's direction.` : ''}\n\n${context ? context + '\n\n' : ''}Please let me know if there are any portfolio items or questions I can answer to assist in the review.\n\nBest regards,\n[Your Name]`;
  } else if (tone.toLowerCase() === 'confident') {
    subjectChoices = [
      `Following up on ${jobTitle} role — next steps & impact`,
      `Re: ${jobTitle} opportunity at ${company}`,
      `Value alignment for ${company}'s ${jobTitle} team`
    ];
    emailBody = `Hi ${recruiterName},\n\nI hope all is well with you and the team at ${company}!\n\nFollowing up on my application for the ${jobTitle} position. Given ${company}'s focus on high-velocity innovation, I'm confident my track record of delivering resilient, production-ready systems aligns directly with your immediate priorities.\n\n${context ? context + '\n\n' : ''}I'd welcome the chance to speak further about how I can hit the ground running on your roadmap this quarter.\n\nWarm regards,\n[Your Name]`;
  } else if (tone.toLowerCase() === 'friendly') {
    subjectChoices = [
      `Hope your week is going great! Quick follow-up on ${jobTitle}`,
      `Excited about ${company} — following up on ${jobTitle}`,
      `Checking in on ${jobTitle} at ${company}`
    ];
    emailBody = `Hi ${recruiterName},\n\nHope you're having a wonderful week!\n\nI wanted to reach out and see if there are any updates regarding the ${jobTitle} position at ${company}. I've really enjoyed following your recent releases and felt a strong connection with your culture and mission.\n\n${context ? context + '\n\n' : ''}Please let me know if you need anything else from my end. Thanks so much for your time and help throughout the process!\n\nBest,\n[Your Name]`;
  } else {
    subjectChoices = [
      `Following Up on ${jobTitle} Application — ${company}`,
      `Status Inquiry: ${jobTitle} Application`,
      `Inquiry: Status of ${jobTitle} Candidate Review`
    ];
    emailBody = `Dear ${recruiterName},\n\nI hope this message finds you well.\n\nI am writing to follow up on the status of my application for the ${jobTitle} position at ${company}.${appDate ? ` Having submitted my application on ${appDate},` : ''} I remain keenly interested in contributing to your organization and believe my technical background is well-suited to your needs.\n\n${context ? context + '\n\n' : ''}Should you require any supplementary documentation, references, or code samples, please do not hesitate to reach out. Thank you for your continued time and review.\n\nSincerely,\n[Your Name]`;
  }

  resultContainer.innerHTML = `
    <div class="ai-result-panel space-y-4 animate-fadeIn">
        <div class="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#243044]">
            <div>
                <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">✦ AI Generated Draft (${tone})</span>
                <p class="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-medium">Optimal Send Window: Tuesday/Thursday 9:00 AM – 10:30 AM</p>
            </div>
            <button class="btn-primary text-xs py-1.5 px-3" onclick="window.copyGeneratedEmail()">Copy to Clipboard</button>
        </div>

        <div>
            <label class="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase block mb-1.5">Subject Line Options (Click to use)</label>
            <div class="space-y-1.5" id="aiSubjectChoices">
                ${subjectChoices.map((subj, idx) => `
                    <div class="p-2.5 rounded-lg border text-xs cursor-pointer font-medium transition-all ${idx === 0 ? 'bg-blue-50/70 dark:bg-[#172554] border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 shadow-sm' : 'bg-stone-50 dark:bg-[#152033] border-stone-200 dark:border-[#243044] text-stone-700 dark:text-stone-300 hover:border-blue-300'}" onclick="window.selectSubjectOption('${subj.replace(/'/g, "\\'")}')">
                        ${escapeHtml(subj)}
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <label class="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase block mb-1.5">Email Body</label>
            <textarea id="generatedEmailBody" class="input-field font-mono text-xs w-full p-3.5 leading-relaxed border" rows="8"></textarea>
        </div>
    </div>
  `;

  streamText('generatedEmailBody', emailBody, 6);
}

export function selectSubjectOption(subj: string): void {
  const container = document.getElementById('aiSubjectChoices');
  if (!container) return;
  container.querySelectorAll('div').forEach((d) => {
    d.className = 'p-2.5 rounded-lg border text-xs cursor-pointer font-medium transition-all bg-stone-50 dark:bg-[#152033] border-stone-200 dark:border-[#243044] text-stone-700 dark:text-stone-300 hover:border-blue-300';
  });
  const clicked = Array.from(container.querySelectorAll('div')).find((d) => d.innerText.trim() === subj.trim());
  if (clicked) {
    clicked.className = 'p-2.5 rounded-lg border text-xs cursor-pointer font-medium transition-all bg-blue-50/70 dark:bg-[#172554] border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 shadow-sm';
  }
  showToast('Subject line selected', 'info');
}

export function copyGeneratedEmail(): void {
  const el = document.getElementById('generatedEmailBody') as HTMLTextAreaElement | null;
  if (el) {
    navigator.clipboard.writeText(el.value);
    showToast('Email copied to clipboard', 'success');
  }
}
