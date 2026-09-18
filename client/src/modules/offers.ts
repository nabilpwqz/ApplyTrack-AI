import { getStatusBg, getStatusColor, getStatusLabel, state } from './state';
import { escapeHtml, formatCurrency } from './utils';

export function renderOfferDesk(): void {
  const container = document.getElementById('offersContent');
  if (!container) return;

  const offers = state.applications.filter((app) => ['offer', 'accepted'].includes(app.status));
  const activeOffers = offers.length
    ? offers
    : state.applications.filter((app) => app.status === 'interview' || app.status === 'final_interview').slice(0, 2);

  container.innerHTML = activeOffers.length
    ? `
        <div class="offer-grid">
            ${activeOffers
              .map((app, index) => {
                const salaryRange =
                  app.salaryMin && app.salaryMax
                    ? `${formatCurrency(app.salaryMin)} – ${formatCurrency(app.salaryMax)}`
                    : 'Comp package pending';
                return `
                    <div class="offer-card card p-6 border border-stone-200 ${index === 0 ? 'best' : ''}">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <p class="text-xs uppercase tracking-wide text-stone-500">${index === 0 ? 'Best fit' : 'Active track'}</p>
                                <h3 class="font-bold text-lg mt-1">${escapeHtml(app.company)}</h3>
                            </div>
                            <span class="status-badge" style="color:${getStatusColor(app.status)};background:${getStatusBg(app.status)}">${escapeHtml(
                  getStatusLabel(app.status)
                )}</span>
                        </div>
                        <p class="text-sm text-stone-700 font-medium">${escapeHtml(app.title)}</p>
                        <div class="mt-4 space-y-2 text-sm text-stone-600">
                            <p><strong>Comp:</strong> ${salaryRange}</p>
                            <p><strong>Mode:</strong> ${escapeHtml(app.workMode || 'Flexible')}</p>
                            <p><strong>Location:</strong> ${escapeHtml(app.location || 'Remote')}</p>
                            <p><strong>Notes:</strong> ${escapeHtml(app.notes || 'Keep momentum high with a follow-up.')}</p>
                        </div>
                    </div>
                `;
              })
              .join('')}
        </div>
      `
    : '<div class="card p-8 text-center text-stone-500">No active offers or finalist roles yet. Keep the pipeline moving.</div>';
}
