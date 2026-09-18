import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import { ApplicationStatus } from '../types';
import { renderDashboard, updateNavBadges } from './dashboard';
import { KANBAN_COLUMNS, persistData, state } from './state';
import { escapeHtml, formatCurrency, showToast } from './utils';

let draggedAppId: number | null = null;

export function renderKanban(): void {
  const container = document.getElementById('kanbanBoard');
  if (!container) return;

  container.innerHTML = KANBAN_COLUMNS.map((col) => {
    const appsInCol = state.applications.filter((a) => a.status === col.key);
    return `
      <div class="kanban-column flex flex-col rounded-2xl overflow-hidden" data-status="${
        col.key
      }" ondragover="event.preventDefault()" ondrop="window.handleKanbanDrop(event, '${col.key}')">
          <div class="kanban-column-header">
              <h3 class="kanban-column-title">
                  <span>${col.label}</span>
                  <span class="kanban-count-badge">${appsInCol.length}</span>
              </h3>
              <button onclick="window.openAddApplicationModal()" class="kanban-add-btn" title="Add role to ${col.label}">+</button>
          </div>
          <div class="p-3 space-y-3 flex-1 overflow-y-auto min-h-[360px]">
              ${
                appsInCol.length
                  ? appsInCol
                      .map(
                        (app) => `
                  <div class="kanban-card"
                       draggable="true"
                       ondragstart="window.handleKanbanDragStart(event, ${app.id})"
                       onclick="window.openAppDetails(${app.id})">
                      <div class="flex items-start justify-between gap-2">
                          <strong class="text-sm font-bold leading-snug">${escapeHtml(app.company)}</strong>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            app.priority === 'High'
                              ? 'priority-high bg-rose-100 text-rose-700'
                              : app.priority === 'Medium'
                              ? 'priority-medium bg-amber-100 text-amber-700'
                              : 'priority-low bg-stone-100 text-stone-700'
                          }">${escapeHtml(app.priority)}</span>
                      </div>
                      <p class="text-xs mt-1 font-medium">${escapeHtml(app.title)}</p>
                      <div class="kanban-card-footer mt-3 flex items-center justify-between text-[11px] pt-2 border-t border-stone-100">
                          <span>${
                            app.salaryMin && app.salaryMax ? formatCurrency(app.salaryMin) : app.location || 'Remote'
                          }</span>
                          <span class="font-semibold text-blue-600">${app.deadline ? 'Due ' + app.deadline : 'Active'}</span>
                      </div>
                  </div>
                `
                      )
                      .join('')
                  : `<div class="kanban-dropzone-empty">Drop roles here</div>`
              }
          </div>
      </div>
    `;
  }).join('');
}

export function handleKanbanDragStart(event: DragEvent, id: number): void {
  draggedAppId = id;
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', String(id));
  }
}

export function handleKanbanDrop(event: DragEvent, newStatus: string): void {
  event.preventDefault();
  if (draggedAppId === null) return;

  const app = state.applications.find((a) => a.id === draggedAppId);
  if (app && app.status !== newStatus) {
    app.status = newStatus as ApplicationStatus;
    const today = new Date().toISOString().split('T')[0];
    app.timeline = app.timeline || [];
    app.timeline.unshift({
      date: today,
      event: `Stage moved to ${newStatus}`,
      type: newStatus,
    });

    persistData();
    renderKanban();
    if (state.currentView === 'dashboard') renderDashboard();
    updateNavBadges();
    showToast(`Moved ${app.company} to ${newStatus}`, 'success');

    graphQLRequest(MUTATIONS.UPDATE_APPLICATION_STATUS, {
      id: app.id,
      status: newStatus,
    }).catch(() => {});
  }
  draggedAppId = null;
}
