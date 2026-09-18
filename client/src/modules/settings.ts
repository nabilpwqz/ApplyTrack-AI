import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import { BillingTransaction, SubscriptionState } from '../types';
import { getSession } from './auth';
import { switchView, updateNavBadges } from './dashboard';
import { persistData, seedDefaultData, state } from './state';
import { escapeHtml, showToast } from './utils';

const SUBSCRIPTION_KEY = 'applytrack_ai_subscription';
const BILLING_LOG_KEY = 'applytrack_ai_billing_transactions';

export function getSubscription(): SubscriptionState {
  try {
    const saved = JSON.parse(localStorage.getItem(SUBSCRIPTION_KEY) || 'null');
    const approved = saved?.plan === 'premium' && saved?.status === 'approved';
    const pending = saved?.status === 'pending' && saved?.requestedPlan === 'premium';
    return {
      plan: approved ? 'premium' : 'free',
      status: pending ? 'pending' : approved ? 'approved' : saved?.status || 'free',
      requestedPlan: pending ? 'premium' : saved?.plan,
      method: typeof saved?.method === 'string' && saved.method ? saved.method : 'International payment',
      updatedAt: saved?.updatedAt || saved?.approvedAt || saved?.requestedAt,
    };
  } catch {
    return { plan: 'free', status: 'free', method: 'International payment' };
  }
}

export function selectSubscriptionPlan(plan: 'free' | 'premium'): void {
  document.querySelectorAll('[data-plan-option]').forEach((option) =>
    option.classList.toggle('selected', (option as HTMLElement).dataset.planOption === plan)
  );

  document.getElementById('paymentMethodSection')?.classList.toggle('hidden', plan !== 'premium');
  document.getElementById('freePlanPrompt')?.classList.toggle('hidden', plan === 'premium');

  const action = document.getElementById('subscriptionAction');
  if (action) action.textContent = plan === 'premium' ? 'Pay for premium plan' : 'Continue with free plan';
}

export function selectPaymentMethod(method: string): void {
  document.querySelectorAll('[data-payment-method]').forEach((option) =>
    option.classList.toggle('selected', (option as HTMLElement).dataset.paymentMethod === method)
  );

  const international = ['International payment', 'PayPal', 'Stripe'].includes(method);
  const crypto = method === 'Crypto' || method.startsWith('Crypto ');
  const key = international ? 'international' : crypto ? 'crypto' : method.toLowerCase().replace(' payment', '').replace('sslcommerz', 'sslcommerz');

  document.querySelectorAll('.gateway-detail').forEach((form) => form.classList.toggle('hidden', form.id !== `gateway-${key}`));

  const label = document.getElementById('billingMethodLabel');
  if (label) label.textContent = method;

  const title = document.getElementById('gatewayFormTitle');
  if (title) {
    title.textContent = crypto
      ? 'Crypto payment details will be reviewed securely.'
      : method === 'PayPal'
      ? 'You will continue to PayPal securely through email.'
      : method === 'Stripe'
      ? 'You will continue to Stripe securely through email.'
      : method === 'SSLCommerz'
      ? 'You will continue to the SSLCommerz secure payment page through email.'
      : method === 'Card'
      ? 'Enter card details on the secure card.'
      : method === 'Bank'
      ? 'Bank transfer instructions will be provided after confirmation through email.'
      : 'You will continue to a secure international payment page through email.';
  }
}

export function updateBillingAmount(): void {
  const rates: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, BDT: 117 };
  const currency = (document.getElementById('billingCurrency') as HTMLSelectElement)?.value || 'USD';
  const amount = (19 * (rates[currency] || 1)).toFixed(2);

  const input = document.getElementById('billingAmountInput') as HTMLInputElement | null;
  if (input) input.value = amount;

  const summary = document.getElementById('billingAmount');
  if (summary) summary.textContent = `${currency} ${amount} / month`;
}

export function getBillingTransactions(): BillingTransaction[] {
  try {
    return JSON.parse(localStorage.getItem(BILLING_LOG_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveBillingTransactions(transactions: BillingTransaction[]): void {
  localStorage.setItem(BILLING_LOG_KEY, JSON.stringify(transactions.slice(0, 12)));
}

function billingReference(prefix: string, length: number): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return `${prefix}-${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()
    .slice(0, length)}`;
}

export function renderBillingTransactions(): void {
  const list = document.getElementById('billingTransactionLog');
  if (!list) return;

  const transactions = getBillingTransactions();
  list.innerHTML = transactions.length
    ? transactions
        .map(
          (item) =>
            `<div class="billing-log-entry p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs mb-2">
              <strong class="text-stone-900">${escapeHtml(item.time)} - [${escapeHtml(item.method)}] ✓ ${escapeHtml(
              item.message
            )}</strong>
              <div class="text-[11px] text-stone-500 mt-1">ID: ${escapeHtml(item.id)} | Amount: ${escapeHtml(
              item.amount
            )} ${escapeHtml(item.currency)} | Status: ${escapeHtml(item.status)}</div>
            </div>`
        )
        .join('')
    : '<div class="billing-log-empty text-xs text-stone-400 py-3">No subscription payments recorded yet.</div>';
}

export function saveSubscription(): void {
  const plan =
    ((document.querySelector('input[name="subscriptionPlan"]:checked') as HTMLInputElement)?.value as any) || 'free';
  const session = getSession() || ({} as any);
  const method =
    ((document.querySelector('[data-payment-method].selected') as HTMLElement)?.dataset.paymentMethod as any) ||
    'International payment';

  if (plan === 'free') {
    localStorage.setItem(
      SUBSCRIPTION_KEY,
      JSON.stringify({ plan: 'free', method, status: 'approved', updatedAt: new Date().toISOString() })
    );
    updateSubscriptionUI();
    showToast('Free plan selected.', 'success');
    return;
  }

  const email = (document.getElementById('billingEmail') as HTMLInputElement)?.value.trim();
  if (!email) {
    showToast('Enter your billing email to continue.', 'error');
    return;
  }

  const request = {
    plan: 'premium',
    requestedPlan: 'premium',
    status: 'pending',
    method,
    requestedBy: { name: session.name || 'Current user', email: session.email || '' },
    requestedAt: new Date().toISOString(),
  };
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(request));

  const amount = (document.getElementById('billingAmountInput') as HTMLInputElement)?.value || '19.00';
  const currency = (document.getElementById('billingCurrency') as HTMLSelectElement)?.value || 'USD';
  const methodCode = method.toUpperCase().replace(/[^A-Z]/g, '');
  const dateCode = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  const transaction: BillingTransaction = {
    time: new Date().toLocaleTimeString(),
    method: methodCode,
    id: billingReference('TXN-' + dateCode + '-' + methodCode, 16),
    gateway: billingReference('GW-' + methodCode, 12),
    amount,
    currency,
    status: 'success',
    message: `${method} payment recorded for verification`,
  };

  const txns = getBillingTransactions();
  txns.unshift(transaction);
  saveBillingTransactions(txns);

  updateSubscriptionUI();
  renderBillingTransactions();

  const status = document.getElementById('billingStatus');
  if (status) {
    status.textContent = 'Premium access is pending admin approval.';
    status.classList.add('show');
  }

  showToast('Premium request sent for admin approval.', 'info');

  graphQLRequest(MUTATIONS.SAVE_SUBSCRIPTION, {
    input: { plan: 'premium', method, email, currency, amount },
  }).catch(() => {});
}

export function updateSubscriptionUI(): void {
  const subscription = getSubscription();
  const premium = subscription.plan === 'premium';
  const input = document.querySelector(`input[name="subscriptionPlan"][value="${subscription.plan}"]`) as HTMLInputElement | null;
  if (input) input.checked = true;

  selectSubscriptionPlan(subscription.plan);
  selectPaymentMethod(subscription.method);

  const badge = document.getElementById('currentPlanBadge');
  if (badge) badge.textContent = premium ? 'Premium plan' : 'Free plan';

  const planLabel = document.getElementById('sidebarUserPlan');
  if (planLabel) planLabel.textContent = premium ? 'Premium Plan' : 'Free Plan';
}

export function renderBackupList(): void {
  const host = document.getElementById('backupList');
  if (!host) return;

  let backups: any[] = [];
  try {
    backups = JSON.parse(localStorage.getItem('applytrack_backups') || '[]');
  } catch {}

  if (!backups.length) {
    host.innerHTML = '<p class="text-xs text-stone-400">No backups yet. Changes will be snapshotted automatically.</p>';
    return;
  }

  host.innerHTML = backups
    .map((b, i) => {
      const date = new Date(b.ts).toLocaleString();
      const count = b.data?.applications?.length || 0;
      return `<div class="backup-item flex items-center justify-between p-2 bg-stone-50 rounded-lg text-xs mb-2">
          <span>${date} · ${count} apps</span>
          <button class="btn-outline" style="padding:4px 10px;font-size:11px;" onclick="window.restoreBackup(${i})">Restore</button>
      </div>`;
    })
    .join('');
}

export function restoreBackup(index: number): void {
  let backups: any[] = [];
  try {
    backups = JSON.parse(localStorage.getItem('applytrack_backups') || '[]');
  } catch {}

  const backup = backups[index];
  if (!backup || !confirm('Restore this backup? Current data will be replaced.')) return;

  state.applications = backup.data.applications || [];
  state.emailImports = backup.data.emailImports || [];
  state.careerGoals = { ...state.careerGoals, ...(backup.data.careerGoals || {}) };

  persistData();
  switchView(state.currentView);
  updateNavBadges();
  renderBackupList();
  showToast('Backup restored successfully', 'success');
}

export function exportData(): void {
  const jsonStr = JSON.stringify({
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    applications: state.applications,
    emailImports: state.emailImports,
    careerGoals: state.careerGoals,
    networkContacts: state.networkContacts,
    storyBank: state.storyBank,
  }, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applytrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('JSON data exported', 'success');
}

export function exportDataCSV(): void {
  const headers = ['ID', 'Company', 'Title', 'Status', 'Priority', 'Work Mode', 'Location', 'Salary Min', 'Salary Max', 'Application Date', 'Deadline', 'Source', 'Notes'];
  const rows = state.applications.map((a) => [
    a.id,
    `"${(a.company || '').replace(/"/g, '""')}"`,
    `"${(a.title || '').replace(/"/g, '""')}"`,
    a.status,
    a.priority,
    a.workMode || '',
    `"${(a.location || '').replace(/"/g, '""')}"`,
    a.salaryMin || 0,
    a.salaryMax || 0,
    a.applicationDate || '',
    a.deadline || '',
    a.source || '',
    `"${(a.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `applytrack-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV data exported', 'success');
}

export function importDataFile(): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.applications)) {
          state.applications = parsed.applications;
        }
        if (Array.isArray(parsed.networkContacts)) {
          state.networkContacts = parsed.networkContacts;
        }
        if (Array.isArray(parsed.storyBank)) {
          state.storyBank = parsed.storyBank;
        }
        if (parsed.careerGoals) {
          state.careerGoals = { ...state.careerGoals, ...parsed.careerGoals };
        }
        persistData();
        switchView(state.currentView);
        updateNavBadges();
        showToast('Data imported successfully', 'success');
      } catch {
        showToast('Invalid JSON file', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function resetAllData(): void {
  if (confirm('Are you sure you want to reset all data to defaults? This will erase custom records.')) {
    localStorage.removeItem('applytrack_ai_data');
    localStorage.removeItem('applytrack_backups');
    seedDefaultData();
    switchView('dashboard');
    updateNavBadges();
    renderBackupList();
    showToast('All data has been reset to defaults', 'info');
  }
}

let deferredPwaPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPwaPrompt = e;
  document.getElementById('pwaInstallBtn')?.classList.remove('hidden');
});

export async function installPWA(): Promise<void> {
  if (!deferredPwaPrompt) {
    showToast('Install not available in this browser.', 'info');
    return;
  }
  deferredPwaPrompt.prompt();
  const { outcome } = await deferredPwaPrompt.userChoice;
  deferredPwaPrompt = null;
  document.getElementById('pwaInstallBtn')?.classList.add('hidden');
  showToast(outcome === 'accepted' ? 'App installed!' : 'Install dismissed', outcome === 'accepted' ? 'success' : 'info');
}

export function renderSettingsView(): void {
  renderBackupList();
  updateSubscriptionUI();
  renderBillingTransactions();
}
