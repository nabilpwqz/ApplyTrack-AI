import { Application } from '../types';
import { isAdmin } from './auth';
import { getStatusLabel, state } from './state';
import { escapeHtml } from './utils';

export function getNeedsAttentionApps(): Application[] {
  const now = new Date();
  return state.applications.filter((a) => {
    if (['rejected', 'withdrawn', 'accepted'].includes(a.status)) return false;
    if (a.deadline) {
      const d = new Date(a.deadline + 'T00:00:00');
      const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 5) return true;
    }
    if (a.status === 'applied') {
      const appDate = new Date((a.applicationDate || '2026-01-01') + 'T00:00:00');
      const daysSince = Math.floor((now.getTime() - appDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSince >= 7) return true;
    }
    return false;
  });
}

export function getNextActionLabel(app: Application): string {
  if (app.status === 'interview' || app.status === 'final_interview') return 'Prep interview answers';
  if (app.status === 'applied') return 'Send follow-up note';
  if (app.status === 'offer') return 'Review & negotiate';
  if (app.status === 'assessment') return 'Complete assessment';
  if (app.deadline) return `Due ${app.deadline}`;
  return 'Review application';
}

export function getUpcomingEvents(limit = 4): Array<{ title: string; company: string; dateLabel: string; type: string }> {
  const events: Array<{ title: string; company: string; dateLabel: string; type: string }> = [];
  state.applications.forEach((a) => {
    if (a.status === 'interview' || a.status === 'final_interview') {
      events.push({
        title: `Interview stage · ${a.title}`,
        company: a.company,
        dateLabel: a.deadline ? `By ${a.deadline}` : 'This week',
        type: 'Interview',
      });
    } else if (a.deadline) {
      events.push({
        title: `Application Deadline · ${a.title}`,
        company: a.company,
        dateLabel: a.deadline,
        type: 'Deadline',
      });
    }
  });
  return events.slice(0, limit);
}

export function getWeekApplicationsCount(): number {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);

  return state.applications.filter((a) => {
    if (!a.applicationDate) return false;
    const d = new Date(a.applicationDate + 'T00:00:00');
    return d >= start && !['saved'].includes(a.status);
  }).length;
}

export function getWeekInterviewCount(): number {
  return state.applications.filter((a) => a.status === 'interview' || a.status === 'final_interview').length;
}

export function renderWeeklyInsightsHTML(): string {
  const weekApps = getWeekApplicationsCount();
  const weekTarget = state.careerGoals.weeklyApplications || 5;
  const weekInts = getWeekInterviewCount();
  const intTarget = state.careerGoals.weeklyInterviews || 2;
  const weekResponses = state.applications.filter((a) => {
    if (!a.applicationDate) return false;
    const d = new Date(a.applicationDate + 'T00:00:00');
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return d >= start && ['interview', 'final_interview', 'offer', 'accepted', 'screening'].includes(a.status);
  }).length;

  const pct = (c: number, t: number) => (t ? Math.min(100, Math.round((c / t) * 100)) : 0);

  return `<div class="nl-weekly-insight">
      <div class="nl-weekly-card"><span>This week · Applications</span><strong>${weekApps}</strong><div class="bar"><span style="width:${pct(
    weekApps,
    weekTarget
  )}%"></span></div></div>
      <div class="nl-weekly-card"><span>Interview stages</span><strong>${weekInts}</strong><div class="bar"><span style="width:${pct(
    weekInts,
    intTarget
  )}%"></span></div></div>
      <div class="nl-weekly-card"><span>Responses (7d)</span><strong>${weekResponses}</strong><div class="bar"><span style="width:${Math.min(
    100,
    weekResponses * 20
  )}%"></span></div></div>
  </div>`;
}

export function getNextLevelActivities(): Array<{ title: string; copy: string; icon: string }> {
  const sorted = [...state.applications].sort(
    (a, b) => new Date(b.applicationDate || 0).getTime() - new Date(a.applicationDate || 0).getTime()
  );
  return sorted.slice(0, 5).map((a) => ({
    title: `${a.title || 'Application'} · ${a.company || 'Company'}`,
    copy: `${getStatusLabel(a.status)}${a.notes ? ' · ' + a.notes.slice(0, 40) : ''}`,
    icon: a.status === 'interview' || a.status === 'final_interview' ? '◎' : a.status === 'offer' || a.status === 'accepted' ? '✓' : '→',
  }));
}

export function renderDashboard(): void {
  renderNextLevelDashboard();
}

export function renderNextLevelDashboard(): void {
  const host = document.getElementById('view-dashboard');
  if (!host) return;

  const total = state.applications.length;
  const active = state.applications.filter((a) => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length;
  const interviews = state.applications.filter((a) => a.status === 'interview' || a.status === 'final_interview').length;
  const offers = state.applications.filter((a) => a.status === 'offer' || a.status === 'accepted').length;
  const attention = getNeedsAttentionApps().length;
  const responseRate = total
    ? Math.round(
        (state.applications.filter((a) => ['interview', 'final_interview', 'offer', 'accepted'].includes(a.status)).length /
          total) *
          100
      )
    : 0;
  const profileScore = Math.min(100, 40 + (total > 0 ? 20 : 0) + (interviews > 0 ? 20 : 0) + (offers > 0 ? 20 : 0));
  const activities = getNextLevelActivities();
  interface QueueItem {
    icon: string;
    title: string;
    copy: string;
    appId?: number;
    view?: string;
    label: string;
  }
  const queue: QueueItem[] = [
    ...getNeedsAttentionApps()
      .slice(0, 3)
      .map((app) => ({
        icon: '!',
        title: app.company,
        copy: getNextActionLabel(app),
        appId: app.id,
        label: 'Review',
      })),
    ...getUpcomingEvents(3)
      .slice(0, 3)
      .map((event) => ({
        icon: '◷',
        title: event.company,
        copy: `${event.type} · ${event.dateLabel}`,
        view: 'calendar',
        label: 'Open',
      })),
  ].slice(0, 4);

  const existing = host.querySelector('.nl-dashboard-content');
  if (existing) existing.remove();

  const wrap = document.createElement('div');
  wrap.className = 'nl-dashboard-content';
  wrap.innerHTML = `
      ${renderWeeklyInsightsHTML()}
      <div class="nl-kpi-strip">
          <div class="nl-kpi"><div class="nl-kpi-top"><span>Pipeline</span><span>◈</span></div><div class="nl-kpi-value">${total}</div><div class="nl-kpi-change">${active} active opportunities</div></div>
          <div class="nl-kpi"><div class="nl-kpi-top"><span>Interviews</span><span>◎</span></div><div class="nl-kpi-value">${interviews}</div><div class="nl-kpi-change">${
    interviews ? 'Interview momentum is building' : 'Add interview stages'
  }</div></div>
          <div class="nl-kpi"><div class="nl-kpi-top"><span>Offers</span><span>✓</span></div><div class="nl-kpi-value">${offers}</div><div class="nl-kpi-change">${
    offers ? 'Keep negotiating' : 'Target the next conversion'
  }</div></div>
          <div class="nl-kpi"><div class="nl-kpi-top"><span>Response rate</span><span>↗</span></div><div class="nl-kpi-value">${responseRate}%</div><div class="nl-kpi-change">${
    attention ? attention + ' need attention' : 'Pipeline is under control'
  }</div></div>
      </div>
      <div class="nl-profile-completion">
          <div class="row"><div><strong style="font-size:13px;">Career command center health</strong><div style="font-size:10px;color:#78716c;margin-top:3px;">Your tracker gets more useful as your pipeline gets richer.</div></div><strong style="font-size:13px;">${profileScore}%</strong></div>
          <div class="nl-progress"><span style="width:${profileScore}%"></span></div>
      </div>
      <div class="nl-quick-actions">
          <button class="nl-quick-action" id="nlBtnAddApp"><strong>＋ Add application</strong><span>Create a new opportunity</span></button>
          <button class="nl-quick-action" id="nlBtnOpenPipeline"><strong>▦ Open pipeline</strong><span>Move applications forward</span></button>
          <button class="nl-quick-action" id="nlBtnGoals"><strong>◎ Career goals</strong><span>Track weekly targets & prep</span></button>
          <button class="nl-quick-action" id="nlBtnAnalytics"><strong>↗ View analytics</strong><span>Inspect conversion metrics</span></button>
      </div>
      <div class="nl-dashboard-grid">
          <div class="nl-panel">
              <div class="nl-panel-head"><div><strong style="font-size:14px;">Recent activity</strong><div style="font-size:10px;color:#a8a29e;margin-top:3px;">Your latest pipeline movement</div></div><button id="nlBtnViewAllApps" style="border:0;background:none;color:#1d4ed8;font-size:11px;font-weight:800;cursor:pointer;">View all →</button></div>
              <div class="nl-panel-body">${
                activities.length
                  ? activities
                      .map(
                        (x) =>
                          `<div class="nl-activity"><div class="nl-activity-icon">${x.icon}</div><div><div class="nl-activity-title">${escapeHtml(
                            x.title
                          )}</div><div class="nl-activity-copy">${escapeHtml(x.copy)}</div></div></div>`
                      )
                      .join('')
                  : `<div class="nl-empty">No activity yet. Add your first application to activate your command center.</div>`
              }</div>
          </div>
          <div class="nl-panel">
              <div class="nl-panel-head"><div><strong style="font-size:14px;">Next actions</strong><div style="font-size:10px;color:#a8a29e;margin-top:3px;">What deserves attention</div></div></div>
              <div class="nl-panel-body">
                  ${
                    queue.length
                      ? queue
                          .map(
                            (item) =>
                              `<div class="nl-queue-item"><div class="nl-queue-icon">${item.icon}</div><div class="nl-queue-copy"><strong>${escapeHtml(
                                item.title
                              )}</strong><span>${escapeHtml(item.copy)}</span></div><button class="nl-queue-action" data-app-id="${item.appId || ''}" data-view="${item.view || ''}">${item.label}</button></div>`
                          )
                          .join('')
                      : `<div style="padding:13px;border-radius:12px;background:#dbeafe;color:#1e3a8a;font-size:11px;line-height:1.55;"><strong>You're clear.</strong> No urgent application actions detected.</div>`
                  }
                  <button class="nl-next-actions-review" id="nlBtnReviewPipeline" style="width:100%;margin-top:10px;padding:10px;border:1px solid #e2e8f0;background:#fff;color:#334155;border-radius:10px;cursor:pointer;font-size:11px;font-weight:800;">Review full pipeline →</button>
              </div>
          </div>
      </div>`;

  const first = host.firstElementChild;
  host.insertBefore(wrap, first);

  // Wire up action listeners
  wrap.querySelector('#nlBtnAddApp')?.addEventListener('click', () => (window as any).openAddApplicationModal?.());
  wrap.querySelector('#nlBtnOpenPipeline')?.addEventListener('click', () => switchView('kanban'));
  wrap.querySelector('#nlBtnGoals')?.addEventListener('click', () => switchView('goals'));
  wrap.querySelector('#nlBtnAnalytics')?.addEventListener('click', () => switchView('analytics'));
  wrap.querySelector('#nlBtnViewAllApps')?.addEventListener('click', () => switchView('applications'));
  wrap.querySelector('#nlBtnReviewPipeline')?.addEventListener('click', () => switchView('applications'));

  wrap.querySelectorAll('.nl-queue-action').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const appId = target.dataset.appId;
      const view = target.dataset.view;
      if (appId) {
        (window as any).openAppDetails?.(parseInt(appId, 10));
      } else if (view) {
        switchView(view);
      }
    });
  });
}

export function buildNotifications(): Array<{ title: string; copy: string; type: string }> {
  const list: Array<{ title: string; copy: string; type: string }> = [];
  const attention = getNeedsAttentionApps();
  attention.slice(0, 4).forEach((a) =>
    list.push({
      title: `Follow-up needed: ${a.company}`,
      copy: `${a.title} is waiting for your next action.`,
      type: 'warn',
    })
  );
  state.applications
    .filter((a) => a.status === 'interview' || a.status === 'final_interview')
    .slice(0, 3)
    .forEach((a) =>
      list.push({
        title: `Interview stage: ${a.company}`,
        copy: `${a.title} is currently in ${getStatusLabel(a.status)}.`,
        type: 'good',
      })
    );
  if (!list.length) {
    list.push({
      title: 'Your workspace is ready',
      copy: 'Add applications to start generating intelligent activity and reminders.',
      type: 'info',
    });
  }
  return list.slice(0, 6);
}

export function renderNotifications(): void {
  const list = document.getElementById('nlNotificationList');
  const badge = document.getElementById('nlNotificationBadge');
  if (!list) return;

  const data = buildNotifications();
  list.innerHTML = data
    .map(
      (n) =>
        `<div class="nl-notification"><span class="nl-notification-dot" style="background:${
          n.type === 'good' ? '#2563eb' : n.type === 'warn' ? '#1d4ed8' : '#a8a29e'
        }"></span><div><p><strong>${escapeHtml(n.title)}</strong></p><p>${escapeHtml(
          n.copy
        )}</p><small>Now</small></div></div>`
    )
    .join('');

  badge?.classList.toggle('show', data.length > 0 && localStorage.getItem('applytrack_notifications_read') !== '1');
}

export function toggleNotifications(): void {
  document.getElementById('nlNotificationPanel')?.classList.toggle('open');
  renderNotifications();
}

export function markNotificationsRead(): void {
  localStorage.setItem('applytrack_notifications_read', '1');
  renderNotifications();
  document.getElementById('nlNotificationPanel')?.classList.remove('open');
}

export function updateNavBadges(): void {
  const appBadge = document.getElementById('appCountBadge');
  if (appBadge) appBadge.textContent = String(state.applications.length);

  const netBadge = document.getElementById('networkCountBadge');
  if (netBadge) netBadge.textContent = String(state.networkContacts.length);

  const importBadge = document.getElementById('pendingImportBadge');
  const pendingImports = state.emailImports.filter((e) => e.status === 'pending').length;
  if (importBadge) {
    importBadge.textContent = String(pendingImports);
    importBadge.classList.toggle('hidden', pendingImports === 0);
  }
}

export function switchView(viewName: string): void {
  if (viewName === 'admin' && !isAdmin()) {
    (window as any).showToast?.('Admin access is restricted to ADMIN accounts.', 'error');
    return;
  }
  state.currentView = viewName;
  document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));

  const targetView = document.getElementById('view-' + viewName);
  if (targetView) targetView.classList.remove('hidden');

  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.classList.remove('active');
    if ((link as HTMLElement).dataset.view === viewName) link.classList.add('active');
  });

  // Close mobile sidebar
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.add('hidden');

  // Trigger sub-renderers
  switch (viewName) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'brief':
      (window as any).renderBrief?.();
      break;
    case 'applications':
      (window as any).renderApplicationsTable?.();
      break;
    case 'kanban':
      (window as any).renderKanban?.();
      break;
    case 'calendar':
      (window as any).renderCalendar?.();
      break;
    case 'analytics':
      (window as any).renderAnalytics?.();
      break;
    case 'network':
      (window as any).renderNetwork?.();
      break;
    case 'offers':
      (window as any).renderOfferDesk?.();
      break;
    case 'stories':
      (window as any).renderStoryBank?.();
      break;
    case 'goals':
      (window as any).renderGoalsView?.();
      break;
    case 'email-import':
      (window as any).renderEmailImports?.();
      break;
    case 'settings':
      (window as any).renderSettingsView?.();
      break;
    case 'admin':
      (window as any).renderAdminView?.();
      break;
  }
}
