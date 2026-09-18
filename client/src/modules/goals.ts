import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import { Application } from '../types';
import { getWeekApplicationsCount, getWeekInterviewCount } from './dashboard';
import { persistData, PREP_ITEMS, PREP_KEY, state } from './state';
import { escapeHtml, showToast } from './utils';

export function getWeekKey(date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${weekNum}`;
}

export function updateGoalStreak(): void {
  const weekKey = getWeekKey();
  const appsDone = getWeekApplicationsCount() >= (state.careerGoals.weeklyApplications || 5);
  if (appsDone && state.careerGoals.lastWeekKey !== weekKey) {
    const prev = state.careerGoals.lastWeekKey;
    const lastWeek = prev ? parseInt(prev.split('-W')[1], 10) : null;
    const thisWeek = parseInt(weekKey.split('-W')[1], 10);
    state.careerGoals.streak = prev && lastWeek && Math.abs(thisWeek - lastWeek) <= 1 ? (state.careerGoals.streak || 0) + 1 : 1;
    state.careerGoals.lastWeekKey = weekKey;
    persistData();
  }
}

export function setGoalRing(arcId: string, labelId: string, current: number, target: number): void {
  const arc = document.getElementById(arcId);
  const label = document.getElementById(labelId);
  const pct = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const circumference = 301.59;
  if (arc) arc.setAttribute('stroke-dashoffset', String(circumference - (pct / 100) * circumference));
  if (label) label.textContent = `${current}/${target}`;
}

export function saveCareerGoals(): void {
  const weeklyApps = parseInt((document.getElementById('goalWeeklyApps') as HTMLInputElement)?.value, 10) || 5;
  const weeklyInterviews = parseInt((document.getElementById('goalWeeklyInterviews') as HTMLInputElement)?.value, 10) || 2;
  const targetRole = ((document.getElementById('goalTargetRole') as HTMLInputElement)?.value || '').trim();
  const targetDate = (document.getElementById('goalTargetDate') as HTMLInputElement)?.value || '';
  const notes = ((document.getElementById('goalNotes') as HTMLTextAreaElement)?.value || '').trim();

  state.careerGoals.weeklyApplications = weeklyApps;
  state.careerGoals.weeklyInterviews = weeklyInterviews;
  state.careerGoals.targetRole = targetRole;
  state.careerGoals.targetDate = targetDate;
  state.careerGoals.notes = notes;

  updateGoalStreak();
  persistData();
  renderGoalsView();
  showToast('Goals saved', 'success');

  graphQLRequest(MUTATIONS.SAVE_CAREER_GOALS, {
    input: { weeklyApplications: weeklyApps, weeklyInterviews, targetRole, targetDate, notes },
  }).catch(() => {});
}

export function ensureInterviewPrep(app: Application): Record<string, boolean> {
  if (typeof app.interviewPrep === 'string') {
    try {
      app.interviewPrep = JSON.parse(app.interviewPrep);
    } catch {
      app.interviewPrep = {};
    }
  }
  if (!app[PREP_KEY] && typeof app.interviewPrep === 'object' && app.interviewPrep !== null) {
    (app as any)[PREP_KEY] = app.interviewPrep;
  }
  if (!(app as any)[PREP_KEY]) {
    (app as any)[PREP_KEY] = Object.fromEntries(PREP_ITEMS.map((item) => [item, false]));
  }
  return (app as any)[PREP_KEY];
}

export function togglePrepItem(appId: number, item: string, checked: boolean): void {
  const app = state.applications.find((a) => a.id === appId);
  if (!app) return;
  const prep = ensureInterviewPrep(app);
  prep[item] = !!checked;
  app.interviewPrep = prep;
  persistData();
  renderInterviewPrepList();

  graphQLRequest(
    `mutation TogglePrep($applicationId: Int!, $item: String!, $checked: Boolean!) {
      toggleInterviewPrepItem(applicationId: $applicationId, item: $item, checked: $checked) {
        id
      }
    }`,
    { applicationId: appId, item, checked }
  ).catch(() => {});
}

export function renderInterviewPrepList(): void {
  const host = document.getElementById('interviewPrepList');
  if (!host) return;

  const interviewing = state.applications.filter((a) => a.status === 'interview' || a.status === 'final_interview');
  if (!interviewing.length) {
    host.innerHTML =
      '<p class="text-stone-400 text-sm text-center py-6">No active interviews. Move a role to interview stage to unlock prep checklists.</p>';
    return;
  }

  host.innerHTML = interviewing
    .map((app) => {
      const prep = ensureInterviewPrep(app);
      const done = PREP_ITEMS.filter((i) => prep[i]).length;
      return `<div class="prep-card card p-4 border border-stone-200 mb-3">
          <h4 class="font-bold text-sm text-stone-800 mb-3 flex items-center justify-between">
            <span>${escapeHtml(app.company)} · ${escapeHtml(app.title)}</span>
            <span style="color:#78716c;font-weight:600;font-size:11px;">(${done}/${PREP_ITEMS.length})</span>
          </h4>
          <div class="space-y-2">
            ${PREP_ITEMS.map(
              (item) =>
                `<label class="prep-check flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input type="checkbox" ${prep[item] ? 'checked' : ''} onchange="window.togglePrepItem(${
                  app.id
                },'${item.replace(/'/g, "\\'")}', this.checked)" class="rounded border-stone-300 accent-blue-600">
                  <span>${escapeHtml(item)}</span>
                </label>`
            ).join('')}
          </div>
      </div>`;
    })
    .join('');
}

export function renderGoalsView(): void {
  updateGoalStreak();

  const setVal = (id: string, val: any) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = val ?? '';
  };

  setVal('goalWeeklyApps', state.careerGoals.weeklyApplications || 5);
  setVal('goalWeeklyInterviews', state.careerGoals.weeklyInterviews || 2);
  setVal('goalTargetRole', state.careerGoals.targetRole || '');
  setVal('goalTargetDate', state.careerGoals.targetDate || '');
  setVal('goalNotes', state.careerGoals.notes || '');

  const streak = state.careerGoals.streak || 0;
  const streakBadge = document.getElementById('goalStreakBadge');
  if (streakBadge) streakBadge.textContent = streak ? `🔥 ${streak} week streak` : '';

  setGoalRing('goalRingAppsArc', 'goalRingAppsLabel', getWeekApplicationsCount(), state.careerGoals.weeklyApplications || 5);
  setGoalRing('goalRingIntArc', 'goalRingIntLabel', getWeekInterviewCount(), state.careerGoals.weeklyInterviews || 2);

  renderInterviewPrepList();
}
