import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import { Application, ApplicationStatus, Priority } from '../types';
import { renderDashboard, updateNavBadges } from './dashboard';
import { getStatusBg, getStatusColor, getStatusLabel, persistData, state } from './state';
import { escapeHtml, formatCurrency, formatDate, generateId, showToast } from './utils';

export function renderApplicationsTable(): void {
  const tbody = document.getElementById('applicationsTableBody');
  if (!tbody) return;

  const search = ((document.getElementById('appSearchInput') as HTMLInputElement)?.value || '').toLowerCase();
  const statusFilter = (document.getElementById('statusFilter') as HTMLSelectElement)?.value || '';
  const priorityFilter = (document.getElementById('priorityFilter') as HTMLSelectElement)?.value || '';

  const filtered = state.applications.filter((a) => {
    const matchesSearch =
      !search ||
      `${a.company} ${a.title} ${a.location || ''} ${a.notes || ''}`.toLowerCase().includes(search);
    const matchesStatus = !statusFilter || a.status === statusFilter;
    const matchesPriority = !priorityFilter || a.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const countBadge = document.getElementById('appFilterCount');
  if (countBadge) countBadge.textContent = `${filtered.length} of ${state.applications.length}`;

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-stone-500">No applications match your filters.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map(
      (app) => `
        <tr class="border-b border-stone-100 hover:bg-stone-50/50 transition-colors cursor-pointer" onclick="window.openAppDetails(${app.id})">
            <td class="py-4 px-4">
                <div class="font-bold text-stone-900">${escapeHtml(app.company)}</div>
                <div class="text-xs text-stone-500">${escapeHtml(app.location || 'Remote')}</div>
            </td>
            <td class="py-4 px-4 font-semibold text-stone-800">${escapeHtml(app.title)}</td>
            <td class="py-4 px-4">
                <span class="status-badge" style="color:${getStatusColor(app.status)};background:${getStatusBg(app.status)}">${escapeHtml(
        getStatusLabel(app.status)
      )}</span>
            </td>
            <td class="py-4 px-4">
                <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${
                  app.priority === 'High'
                    ? 'bg-rose-100 text-rose-700'
                    : app.priority === 'Medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-100 text-stone-700'
                }">${escapeHtml(app.priority)}</span>
            </td>
            <td class="py-4 px-4 text-sm text-stone-600">${formatDate(app.applicationDate)}</td>
            <td class="py-4 px-4 text-sm text-stone-600">${
              app.salaryMin && app.salaryMax
                ? `${formatCurrency(app.salaryMin)} – ${formatCurrency(app.salaryMax)}`
                : '—'
            }</td>
            <td class="py-4 px-4 text-right" onclick="event.stopPropagation()">
                <button class="p-1.5 hover:bg-stone-200 rounded-lg mr-1" onclick="window.openEditApplication(${app.id})" title="Edit">
                    <svg class="w-4 h-4 text-stone-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/></svg>
                </button>
                <button class="p-1.5 hover:bg-rose-100 text-stone-500 hover:text-rose-600 rounded-lg" onclick="window.deleteApplication(${app.id})" title="Delete">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                </button>
            </td>
        </tr>
      `
    )
    .join('');
}

export function openAddApplicationModal(): void {
  state.editingId = null;
  const titleEl = document.getElementById('addAppModalTitle');
  if (titleEl) titleEl.textContent = 'Add Application';
  const idInput = document.getElementById('editingAppId') as HTMLInputElement | null;
  if (idInput) idInput.value = '';

  [
    'formCompany', 'formTitle', 'formUrl', 'formLocation', 'formWorkMode', 'formEmploymentType',
    'formSalaryMin', 'formSalaryMax', 'formAppDate', 'formDeadline', 'formSource', 'formPriority',
    'formStatus', 'formResume', 'formRecruiterName', 'formRecruiterEmail', 'formNotes', 'formTags',
  ].forEach((id) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = '';
  });

  const statusEl = document.getElementById('formStatus') as HTMLSelectElement | null;
  if (statusEl) statusEl.value = 'saved';

  const priorityEl = document.getElementById('formPriority') as HTMLSelectElement | null;
  if (priorityEl) priorityEl.value = 'Medium';

  const dateEl = document.getElementById('formAppDate') as HTMLInputElement | null;
  if (dateEl) dateEl.value = new Date().toISOString().split('T')[0];

  document.getElementById('addAppModal')?.classList.remove('hidden');
}

export function openEditApplication(id: number): void {
  const app = state.applications.find((a) => a.id === id);
  if (!app) return;
  state.editingId = id;

  const titleEl = document.getElementById('addAppModalTitle');
  if (titleEl) titleEl.textContent = 'Edit Application';

  const idInput = document.getElementById('editingAppId') as HTMLInputElement | null;
  if (idInput) idInput.value = String(id);

  const setVal = (elemId: string, val: any) => {
    const el = document.getElementById(elemId) as HTMLInputElement | null;
    if (el) el.value = val ?? '';
  };

  setVal('formCompany', app.company);
  setVal('formTitle', app.title);
  setVal('formUrl', app.url);
  setVal('formLocation', app.location);
  setVal('formWorkMode', app.workMode);
  setVal('formEmploymentType', app.employmentType);
  setVal('formSalaryMin', app.salaryMin || '');
  setVal('formSalaryMax', app.salaryMax || '');
  setVal('formAppDate', app.applicationDate);
  setVal('formDeadline', app.deadline);
  setVal('formSource', app.source);
  setVal('formPriority', app.priority || 'Medium');
  setVal('formStatus', app.status || 'saved');
  setVal('formResume', app.resumeVersion);
  setVal('formRecruiterName', app.recruiterName);
  setVal('formRecruiterEmail', app.recruiterEmail);
  setVal('formNotes', app.notes);
  setVal('formTags', (app.tags || []).join(', '));

  document.getElementById('addAppModal')?.classList.remove('hidden');
}

export function closeAddAppModal(): void {
  document.getElementById('addAppModal')?.classList.add('hidden');
  state.editingId = null;
}

export async function saveApplication(): Promise<void> {
  const company = ((document.getElementById('formCompany') as HTMLInputElement)?.value || '').trim();
  const title = ((document.getElementById('formTitle') as HTMLInputElement)?.value || '').trim();

  if (!company || !title) {
    showToast('Please enter at least a company and job title', 'error');
    return;
  }

  const appData: Partial<Application> = {
    company,
    title,
    url: ((document.getElementById('formUrl') as HTMLInputElement)?.value || '').trim(),
    location: ((document.getElementById('formLocation') as HTMLInputElement)?.value || '').trim(),
    workMode: (document.getElementById('formWorkMode') as HTMLSelectElement)?.value as any,
    employmentType: (document.getElementById('formEmploymentType') as HTMLSelectElement)?.value,
    salaryMin: parseInt((document.getElementById('formSalaryMin') as HTMLInputElement)?.value || '0', 10) || 0,
    salaryMax: parseInt((document.getElementById('formSalaryMax') as HTMLInputElement)?.value || '0', 10) || 0,
    applicationDate:
      (document.getElementById('formAppDate') as HTMLInputElement)?.value ||
      new Date().toISOString().split('T')[0],
    deadline: (document.getElementById('formDeadline') as HTMLInputElement)?.value,
    source: (document.getElementById('formSource') as HTMLSelectElement)?.value,
    priority: ((document.getElementById('formPriority') as HTMLSelectElement)?.value || 'Medium') as Priority,
    status: ((document.getElementById('formStatus') as HTMLSelectElement)?.value || 'saved') as ApplicationStatus,
    notes: ((document.getElementById('formNotes') as HTMLTextAreaElement)?.value || '').trim(),
    recruiterName: ((document.getElementById('formRecruiterName') as HTMLInputElement)?.value || '').trim(),
    recruiterEmail: ((document.getElementById('formRecruiterEmail') as HTMLInputElement)?.value || '').trim(),
    resumeVersion: ((document.getElementById('formResume') as HTMLInputElement)?.value || '').trim(),
    tags: ((document.getElementById('formTags') as HTMLInputElement)?.value || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
  };

  if (state.editingId) {
    const idx = state.applications.findIndex((a) => a.id === state.editingId);
    if (idx > -1) {
      state.applications[idx] = { ...state.applications[idx], ...appData } as Application;
      showToast('Application updated successfully', 'success');
      graphQLRequest(MUTATIONS.UPDATE_APPLICATION, { id: state.editingId, input: appData }).catch(() => {});
    }
  } else {
    const newApp: Application = {
      ...(appData as Application),
      id: generateId(),
      timeline: [
        {
          date: appData.applicationDate || new Date().toISOString().split('T')[0],
          event: 'Application added to tracker',
          type: 'submitted',
        },
      ],
    };
    state.applications.unshift(newApp);
    showToast('Application added successfully', 'success');
    graphQLRequest(MUTATIONS.CREATE_APPLICATION, { input: appData }).catch(() => {});
  }

  persistData();
  closeAddAppModal();
  if (state.currentView === 'dashboard') renderDashboard();
  if (state.currentView === 'applications') renderApplicationsTable();
  if (state.currentView === 'kanban') (window as any).renderKanban?.();
  if (state.currentView === 'analytics') (window as any).renderAnalytics?.();
  updateNavBadges();
}

export function deleteApplication(id: number): void {
  if (confirm('Are you sure you want to delete this application?')) {
    state.applications = state.applications.filter((a) => a.id !== id);
    persistData();
    graphQLRequest(MUTATIONS.DELETE_APPLICATION, { id }).catch(() => {});
    if (state.currentView === 'dashboard') renderDashboard();
    if (state.currentView === 'applications') renderApplicationsTable();
    if (state.currentView === 'kanban') (window as any).renderKanban?.();
    updateNavBadges();
    showToast('Application deleted', 'info');
  }
}

export function openAppDetails(id: number): void {
  const app = state.applications.find((a) => a.id === id);
  if (!app) return;

  const titleEl = document.getElementById('detailsTitle');
  const subEl = document.getElementById('detailsSubtitle');
  const contentEl = document.getElementById('detailsContent');

  if (titleEl) titleEl.textContent = `${app.company} — ${app.title}`;
  if (subEl) subEl.textContent = `${app.location || 'Remote'} · Applied ${formatDate(app.applicationDate)}`;

  if (contentEl) {
    contentEl.innerHTML = `
      <div class="space-y-6">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="p-3 bg-stone-50 rounded-xl">
                  <span class="text-[11px] text-stone-500 font-semibold uppercase">Status</span>
                  <div class="mt-1"><span class="status-badge" style="color:${getStatusColor(app.status)};background:${getStatusBg(app.status)}">${escapeHtml(
                    getStatusLabel(app.status)
                  )}</span></div>
              </div>
              <div class="p-3 bg-stone-50 rounded-xl">
                  <span class="text-[11px] text-stone-500 font-semibold uppercase">Priority</span>
                  <div class="font-bold text-stone-900 mt-1">${escapeHtml(app.priority)}</div>
              </div>
              <div class="p-3 bg-stone-50 rounded-xl">
                  <span class="text-[11px] text-stone-500 font-semibold uppercase">Salary</span>
                  <div class="font-bold text-stone-900 mt-1">${
                    app.salaryMin && app.salaryMax
                      ? `${formatCurrency(app.salaryMin)} – ${formatCurrency(app.salaryMax)}`
                      : 'Not disclosed'
                  }</div>
              </div>
              <div class="p-3 bg-stone-50 rounded-xl">
                  <span class="text-[11px] text-stone-500 font-semibold uppercase">Work Mode</span>
                  <div class="font-bold text-stone-900 mt-1">${escapeHtml(app.workMode || 'Flexible')}</div>
              </div>
          </div>

          <div>
              <h4 class="font-bold text-stone-900 text-sm mb-2">Recruiter & Contact</h4>
              <p class="text-sm text-stone-600">${
                app.recruiterName
                  ? `${escapeHtml(app.recruiterName)} ${
                      app.recruiterEmail ? `· <a href="mailto:${app.recruiterEmail}" class="text-blue-600">${escapeHtml(app.recruiterEmail)}</a>` : ''
                    }`
                  : 'No direct recruiter assigned.'
              }</p>
          </div>

          <div>
              <h4 class="font-bold text-stone-900 text-sm mb-2">Notes & Context</h4>
              <p class="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl">${escapeHtml(app.notes || 'No notes added yet.')}</p>
          </div>

          <div>
              <h4 class="font-bold text-stone-900 text-sm mb-2">Application Timeline</h4>
              <div class="space-y-2">
                  ${(app.timeline || [])
                    .map(
                      (t) => `
                      <div class="flex items-center gap-3 text-xs text-stone-600 border-l-2 border-blue-500 pl-3 py-1">
                          <span class="font-semibold text-stone-800">${formatDate(t.date)}</span>
                          <span>${escapeHtml(t.event)}</span>
                      </div>
                  `
                    )
                    .join('')}
              </div>
          </div>

          <div class="flex gap-3 pt-4 border-t border-stone-200">
              <button class="btn-primary flex-1" onclick="window.closeAppDetailsModal();window.openEditApplication(${app.id})">Edit Application</button>
              <button class="btn-outline" onclick="window.closeAppDetailsModal()">Close</button>
          </div>
      </div>
    `;
  }

  document.getElementById('appDetailsModal')?.classList.remove('hidden');
}

export function closeAppDetailsModal(): void {
  document.getElementById('appDetailsModal')?.classList.add('hidden');
}
