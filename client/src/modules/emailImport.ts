import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import { updateNavBadges } from './dashboard';
import { persistData, state } from './state';
import { escapeHtml, formatDate, generateId, showToast } from './utils';

export function renderEmailImports(): void {
  const container = document.getElementById('emailPendingList') || document.getElementById('emailImportList');
  const countBadge = document.getElementById('pendingCount');

  const pending = state.emailImports.filter((e) => e.status === 'pending');

  if (countBadge) {
    countBadge.textContent = pending.length ? `(${pending.length} pending)` : '(0 pending)';
  }

  if (!container) return;

  if (!pending.length) {
    container.innerHTML = `
      <div class="card p-8 text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121a2b] shadow-sm rounded-2xl">
        <div class="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>
        </div>
        <p class="font-extrabold text-slate-900 dark:text-white text-base">No pending email imports</p>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">All detected recruitment emails have been filed into your pipeline. Click "Sync Emails" to check for new messages.</p>
        <button onclick="window.simulateEmailSync()" class="btn-outline text-xs mt-4 inline-flex items-center gap-2 py-2 px-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:border-blue-500 shadow-sm">
          <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
          Check for New Emails
        </button>
      </div>`;
    updateNavBadges();
    return;
  }

  container.innerHTML = pending
    .map(
      (item) => `
        <div class="email-import-item mb-3.5 bg-white dark:bg-[#121a2b] border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div class="email-import-details flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 mb-1.5">
                        <span class="font-extrabold text-slate-900 dark:text-white text-base tracking-tight company-name">${escapeHtml(item.company)}</span>
                        <span class="text-xs px-2.5 py-0.5 rounded-full font-extrabold ${
                          item.confidence === 'High'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }">${escapeHtml(item.confidence)} Match</span>
                    </div>
                    <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 job-title">${escapeHtml(item.title)}</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap meta-text">
                      <span class="italic">Subject: "${escapeHtml(item.emailSubject)}"</span>
                      <span>·</span>
                      <span>Detected ${formatDate(item.detectedDate)}</span>
                    </p>
                    
                    <div class="mt-3 flex flex-wrap items-center gap-2.5 text-xs">
                        ${item.extractData?.recruiterName ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium">👤 ${escapeHtml(item.extractData.recruiterName)}</span>` : ''}
                        ${item.extractData?.recruiterEmail ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-mono text-[11px]">📧 ${escapeHtml(item.extractData.recruiterEmail)}</span>` : ''}
                        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold uppercase tracking-wider">
                          📊 Stage: ${(item.extractData?.status || 'applied')}
                        </span>
                    </div>
                </div>
                <div class="email-import-actions flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <button class="btn-primary text-xs py-2 px-4 shadow-sm hover:shadow-md active:scale-95 transition-all font-bold" onclick="window.acceptEmailImport(${item.id})">Accept & Track</button>
                    <button class="btn-outline text-xs py-2 px-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-300 dark:border-slate-700 hover:border-slate-400 active:scale-95 transition-all font-semibold" onclick="window.dismissEmailImport(${item.id})">Dismiss</button>
                </div>
            </div>
        </div>
      `
    )
    .join('');

  updateNavBadges();
}

export function acceptEmailImport(id: number): void {
  const item = state.emailImports.find((e) => e.id === id);
  if (!item) return;

  item.status = 'accepted';

  const newApp = {
    id: generateId(),
    company: item.company,
    title: item.title,
    url: '',
    location: item.extractData?.location || 'Remote',
    workMode: 'Remote' as const,
    employmentType: 'Full-time' as const,
    salaryMin: 0,
    salaryMax: 0,
    applicationDate: item.detectedDate || new Date().toISOString().split('T')[0],
    deadline: '',
    source: 'Email Import',
    priority: 'Medium' as const,
    status: (item.extractData?.status as any) || 'applied',
    notes: `Auto-imported from recruiter email: "${item.emailSubject}"`,
    recruiterName: item.extractData?.recruiterName || '',
    recruiterEmail: item.extractData?.recruiterEmail || '',
    resumeVersion: 'v1',
    tags: ['email-detected'],
    timeline: [
      {
        date: item.detectedDate || new Date().toISOString().split('T')[0],
        event: `Imported from email: "${item.emailSubject}"`,
        type: 'submitted' as const,
      },
    ],
  };

  state.applications.unshift(newApp);

  persistData();
  renderEmailImports();
  updateNavBadges();
  showToast(`Added ${item.company} (${item.title}) to your tracker!`, 'success');

  graphQLRequest(MUTATIONS.PROCESS_EMAIL_IMPORT, { id, action: 'accept' }).catch(() => {});
}

// Alias for backward compatibility
export const importEmailApp = acceptEmailImport;

export function dismissEmailImport(id: number): void {
  const item = state.emailImports.find((e) => e.id === id);
  if (!item) return;

  item.status = 'dismissed';
  persistData();
  renderEmailImports();
  updateNavBadges();
  showToast(`Dismissed import for ${item.company}`, 'info');

  graphQLRequest(MUTATIONS.PROCESS_EMAIL_IMPORT, { id, action: 'dismiss' }).catch(() => {});
}

// Pool of realistic recruitment emails for simulated sync
const EMAIL_POOLS = [
  {
    company: 'Dropbox',
    title: 'Full Stack Engineer',
    emailSubject: 'Application Received - Dropbox Engineering',
    status: 'applied',
    recruiterName: 'Kelly Wu',
    recruiterEmail: 'kelly.wu@dropbox.com',
    confidence: 'High',
  },
  {
    company: 'Pinterest',
    title: 'Frontend Developer (Web Core)',
    emailSubject: 'Interview Request - Pinterest Product Team',
    status: 'interview',
    recruiterName: 'James Kim',
    recruiterEmail: 'james.kim@pinterest.com',
    confidence: 'High',
  },
  {
    company: 'Nvidia',
    title: 'Software Engineer - Omniverse Web',
    emailSubject: 'Application Confirmation - Nvidia Careers',
    status: 'applied',
    recruiterName: 'Alex Rivera',
    recruiterEmail: 'arivera@nvidia.com',
    confidence: 'High',
  },
  {
    company: 'Stripe',
    title: 'Frontend Infrastructure Engineer',
    emailSubject: 'Next steps with Stripe Engineering',
    status: 'screening',
    recruiterName: 'Elena Rostova',
    recruiterEmail: 'recruiter@example.com',
    confidence: 'Medium',
  },
  {
    company: 'Linear',
    title: 'Product Engineer (Desktop & Web)',
    emailSubject: 'Linear - Let\'s connect about your background',
    status: 'interview',
    recruiterName: 'Tuomas Artman',
    recruiterEmail: 'tuomas@linear.app',
    confidence: 'High',
  },
  {
    company: 'Figma',
    title: 'Senior Systems UI Engineer',
    emailSubject: 'Figma recruiting team: Conversation request',
    status: 'screening',
    recruiterName: 'Maya Thorne',
    recruiterEmail: 'recruiter@example.com',
    confidence: 'High',
  },
];

let syncIteration = 0;

export function simulateEmailSync(): void {
  const today = new Date().toISOString().split('T')[0];
  const offset = (syncIteration * 2) % EMAIL_POOLS.length;
  const picked = [
    EMAIL_POOLS[offset],
    EMAIL_POOLS[(offset + 1) % EMAIL_POOLS.length],
  ];
  syncIteration++;

  const newDetections = picked.map((template, idx) => ({
    id: generateId() + idx,
    company: template.company,
    title: template.title,
    source: 'email',
    status: 'pending' as const,
    detectedDate: today,
    confidence: template.confidence,
    emailSubject: template.emailSubject,
    extractData: {
      company: template.company,
      title: template.title,
      status: template.status,
      recruiterName: template.recruiterName,
      recruiterEmail: template.recruiterEmail,
    },
  }));

  state.emailImports.unshift(...newDetections);
  persistData();
  renderEmailImports();
  updateNavBadges();

  showToast(`Detected ${newDetections.length} new recruitment emails from Gmail`, 'info');

  // Trigger Refresh Pop-up
  showRefreshPopup(newDetections);
}

// ==================== REFRESH POP-UP LOGIC ====================
export function showRefreshPopup(newItems: any[]): void {
  let popup = document.getElementById('refreshPopupBanner');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'refreshPopupBanner';
    popup.className =
      'fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] rounded-2xl p-5 shadow-2xl transition-all duration-300 transform translate-y-0 opacity-100';
    document.body.appendChild(popup);
  }

  const companiesList = newItems.map((item) => item.company).join(', ');

  popup.innerHTML = `
    <div class="flex items-start gap-4">
      <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md animate-pulse">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="text-[11px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping"></span>
            Pipeline Influx Detected
          </span>
          <button onclick="window.closeRefreshPopup()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs p-1" title="Dismiss">✕</button>
        </div>
        <h4 class="text-sm font-extrabold text-slate-900 dark:text-white mt-1">New Recruitment Emails Captured</h4>
        <p class="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
          Auto-detected <strong class="text-blue-600 dark:text-blue-400 font-bold">${newItems.length}</strong> new positions from <strong class="text-slate-900 dark:text-white">${escapeHtml(companiesList)}</strong>.
        </p>
        <div class="mt-3.5 flex items-center gap-2">
          <button onclick="window.handleRefreshAndReview()" class="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-md hover:shadow-lg font-bold transition-all active:scale-95">
            <span>🔄 Refresh & Review</span>
          </button>
          <button onclick="window.closeRefreshPopup()" class="btn-outline text-xs py-2 px-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-300 dark:border-slate-700 active:scale-95 font-semibold">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  `;

  popup.classList.remove('hidden');
}

export function closeRefreshPopup(): void {
  const popup = document.getElementById('refreshPopupBanner');
  if (popup) {
    popup.classList.add('hidden');
  }
}

export function handleRefreshAndReview(): void {
  closeRefreshPopup();
  const switchFn = (window as any).switchView;
  if (typeof switchFn === 'function') {
    switchFn('email-import');
  }
  renderEmailImports();
  const pendingContainer = document.getElementById('emailPendingList');
  if (pendingContainer) {
    pendingContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pendingContainer.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
    setTimeout(() => {
      pendingContainer.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
    }, 1500);
  }
  showToast('Refreshed inbox capture. Review pending detections.', 'success');
}
