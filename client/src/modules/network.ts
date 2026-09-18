import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import { NetworkContact } from '../types';
import { updateNavBadges } from './dashboard';
import { persistData, state } from './state';
import { escapeHtml, formatDate, generateId, showToast } from './utils';

export function openContactModal(): void {
  document.getElementById('contactModal')?.classList.remove('hidden');
}

export function closeContactModal(): void {
  document.getElementById('contactModal')?.classList.add('hidden');
}

export async function saveContact(): Promise<void> {
  const name = ((document.getElementById('ctName') as HTMLInputElement)?.value || '').trim();
  if (!name) {
    showToast('Name is required', 'error');
    return;
  }

  const role = (document.getElementById('ctRole') as HTMLSelectElement)?.value || 'Recruiter';
  const company = ((document.getElementById('ctCompany') as HTMLInputElement)?.value || '').trim() || 'Unspecified';
  const email = ((document.getElementById('ctEmail') as HTMLInputElement)?.value || '').trim();
  const notes = ((document.getElementById('ctNotes') as HTMLTextAreaElement)?.value || '').trim();
  const lastTouch = new Date().toISOString().split('T')[0];

  const contact: NetworkContact = {
    id: generateId(),
    name,
    role,
    company,
    email,
    notes,
    lastTouch,
  };

  state.networkContacts.unshift(contact);
  persistData();
  renderNetwork();
  closeContactModal();

  // Reset inputs
  (document.getElementById('ctName') as HTMLInputElement).value = '';
  (document.getElementById('ctRole') as HTMLSelectElement).value = 'Recruiter';
  (document.getElementById('ctCompany') as HTMLInputElement).value = '';
  (document.getElementById('ctEmail') as HTMLInputElement).value = '';
  (document.getElementById('ctNotes') as HTMLTextAreaElement).value = '';

  updateNavBadges();
  showToast('Contact added', 'success');

  graphQLRequest(MUTATIONS.CREATE_CONTACT, {
    input: { name, role, company, email, notes },
  }).catch(() => {});
}

export function renderNetwork(): void {
  const grid = document.getElementById('networkGrid');
  if (!grid) return;

  const search = ((document.getElementById('networkSearch') as HTMLInputElement)?.value || '').toLowerCase();
  const roleFilter = (document.getElementById('networkFilter') as HTMLSelectElement)?.value || '';

  const list = state.networkContacts.filter((contact) => {
    const matchesSearch =
      !search || `${contact.name} ${contact.company} ${contact.role}`.toLowerCase().includes(search);
    const matchesRole = !roleFilter || contact.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!list.length) {
    grid.innerHTML = '<div class="col-span-full card p-8 text-center text-stone-500">No contacts match your filters.</div>';
    return;
  }

  grid.innerHTML = list
    .map(
      (contact) => `
        <div class="network-card card p-5 border border-stone-200">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <p class="font-bold text-stone-900">${escapeHtml(contact.name)}</p>
                    <p class="text-xs text-stone-500">${escapeHtml(contact.role)} · ${escapeHtml(contact.company)}</p>
                </div>
                <span class="tag-pill">${escapeHtml(contact.role)}</span>
            </div>
            <div class="mt-4 space-y-2 text-sm text-stone-600">
                <p>${contact.email ? `<a href="mailto:${escapeHtml(contact.email)}" class="text-blue-600">${escapeHtml(contact.email)}</a>` : 'No email shared'}</p>
                <p>${escapeHtml(contact.notes || 'No relationship notes yet.')}</p>
            </div>
            <div class="mt-4 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100 pt-3">
                <span>Last touch</span>
                <span>${formatDate(contact.lastTouch)}</span>
            </div>
        </div>
      `
    )
    .join('');
}
