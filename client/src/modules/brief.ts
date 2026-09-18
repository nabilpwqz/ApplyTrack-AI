import { graphQLRequest } from '../api/graphqlClient';
import { getNeedsAttentionApps, getNextActionLabel, getUpcomingEvents } from './dashboard';
import { state } from './state';
import { escapeHtml, showToast } from './utils';

export function renderBrief(): void {
  const container = document.getElementById('briefContent');
  if (!container) return;

  const totalApps = state.applications.length;
  const active = state.applications.filter((a) => !['rejected', 'withdrawn', 'accepted'].includes(a.status)).length;
  const interviews = state.applications.filter((a) => a.status === 'interview' || a.status === 'final_interview').length;
  const needsAttention = getNeedsAttentionApps().length;
  const nextUp = getUpcomingEvents(3);
  const companyPulse = state.applications.slice(0, 3).map((app) => ({
    company: app.company,
    status: app.status,
    priority: app.priority,
    next: getNextActionLabel(app),
  }));

  const heat = Array.from({ length: 7 }, (_, i) => {
    const score = Math.min(100, (i + 1) * 18 + (i % 2 === 0 ? 8 : 0));
    let className = 'heat-cell';
    if (score >= 75) className += ' on';
    else if (score >= 45) className += ' mid';
    return `<div class="${className}">${i + 1}</div>`;
  }).join('');

  container.innerHTML = `
      <div class="brief-hero">
          <div class="v9-kicker">This morning</div>
          <h3>Build momentum before lunch</h3>
          <p>High-signal work is concentrated around follow-ups, interview prep and one clean outreach push. The system is flagging the most valuable 90-minute actions.</p>
          <div class="heat-row">${heat}</div>
      </div>
      <div class="brief-grid">
          <div class="space-y-4">
              <div class="card p-5">
                  <div class="flex items-center justify-between mb-3">
                      <h3 class="font-bold text-lg">Priority actions</h3>
                      <span class="studio-chip">Live queue</span>
                  </div>
                  <div class="space-y-3">
                      ${
                        nextUp.length
                          ? nextUp
                              .map(
                                (item) => `
                          <div class="flex items-start justify-between gap-4 rounded-xl border border-stone-200 p-3 bg-stone-50/60">
                              <div>
                                  <p class="font-semibold text-sm text-stone-800">${escapeHtml(item.title)}</p>
                                  <p class="text-xs text-stone-500">${escapeHtml(item.company)} · ${escapeHtml(item.dateLabel)}</p>
                              </div>
                              <span class="text-xs font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-700">${escapeHtml(item.type)}</span>
                          </div>
                      `
                              )
                              .join('')
                          : '<p class="text-sm text-stone-500">No urgent actions for today.</p>'
                      }
                  </div>
              </div>
              <div class="card p-5">
                  <h3 class="font-bold text-lg mb-3">Pulse</h3>
                  <div class="grid grid-cols-2 gap-3">
                      <div class="rounded-xl bg-stone-50 p-3"><p class="text-[11px] uppercase tracking-wide text-stone-500">Total</p><p class="text-2xl font-bold text-stone-900">${totalApps}</p></div>
                      <div class="rounded-xl bg-blue-50 p-3"><p class="text-[11px] uppercase tracking-wide text-stone-500">Active</p><p class="text-2xl font-bold text-blue-700">${active}</p></div>
                      <div class="rounded-xl bg-blue-50 p-3"><p class="text-[11px] uppercase tracking-wide text-stone-500">Interviews</p><p class="text-2xl font-bold text-blue-700">${interviews}</p></div>
                      <div class="rounded-xl bg-slate-100 p-3"><p class="text-[11px] uppercase tracking-wide text-stone-500">Needs attention</p><p class="text-2xl font-bold text-slate-700">${needsAttention}</p></div>
                  </div>
              </div>
          </div>
          <div class="space-y-4">
              <div class="card p-5">
                  <h3 class="font-bold text-lg mb-4">Company health</h3>
                  <div class="flex items-center justify-center py-2">
                      <div class="health-ring" style="--pct:${Math.min(100, Math.max(35, 72))}%">
                          <span>${Math.min(100, Math.max(35, 72))}%</span>
                      </div>
                  </div>
                  <div class="mt-4 space-y-2">
                      ${companyPulse
                        .map(
                          (item) => `
                          <div class="flex items-center justify-between text-sm text-stone-600">
                              <span>${escapeHtml(item.company)}</span>
                              <span class="font-semibold text-stone-800">${escapeHtml(item.next)}</span>
                          </div>
                      `
                        )
                        .join('')}
                  </div>
              </div>
              <div class="card p-5">
                  <h3 class="font-bold text-lg mb-3">Quick capture</h3>
                  <div class="quick-capture">
                      <input id="briefQuickNote" type="text" placeholder="Add quick note…" />
                      <button type="button" onclick="window.addQuickBriefNote()">Save</button>
                  </div>
              </div>
          </div>
      </div>
  `;
}

export function addQuickBriefNote(): void {
  const input = document.getElementById('briefQuickNote') as HTMLInputElement | null;
  const value = input?.value?.trim();
  if (!value) {
    showToast('Write a note before saving', 'info');
    return;
  }
  const note = { id: Date.now(), text: value, date: new Date().toISOString().split('T')[0] };
  const notes = JSON.parse(localStorage.getItem('applytrack_brief_notes') || '[]');
  notes.unshift(note);
  localStorage.setItem('applytrack_brief_notes', JSON.stringify(notes.slice(0, 10)));
  if (input) input.value = '';
  showToast('Brief note saved', 'success');
  renderBrief();

  graphQLRequest(
    `mutation CreateNote($text: String!) { createBriefNote(text: $text) { id text } }`,
    { text: value }
  ).catch(() => {});
}
