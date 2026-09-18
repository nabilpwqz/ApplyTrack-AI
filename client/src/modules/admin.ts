import { getSession, isAdmin, saveSession } from './auth';
import { getSubscription, updateSubscriptionUI } from './settings';
import { escapeHtml, formatDate, generateId, showToast } from './utils';

export interface AdminUserRecord {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  plan: 'Free' | 'Pro' | 'Premium VIP' | 'Enterprise';
  applications: number;
  status: 'active' | 'blocked';
  joinedDate: string;
}

export interface PaymentRecord {
  id: string;
  name: string;
  email: string;
  plan: string;
  amount: string;
  method: string;
  date: string;
  status: 'Completed' | 'Refunded' | 'Pending';
  txnId: string;
}

export interface CompanyHealthRecord {
  name: string;
  healthStatus: 'Healthy' | 'Moderate' | 'At Risk' | 'Hiring Freeze';
  score: number;
  runway: string;
  layoffRisk: 'Low' | 'Moderate' | 'High';
  headcountTrend: 'Growing' | 'Stable' | 'Contracting' | 'Frozen';
  lastUpdated: string;
}

export interface AuditLogEntry {
  id: number;
  timestamp: string;
  operator: string;
  action: string;
  type: 'security' | 'billing' | 'intelligence' | 'system';
}

const DEFAULT_USERS: AdminUserRecord[] = [
  { id: 1, name: 'Ava Morgan', email: 'ava.morgan@example.com', role: 'USER', plan: 'Premium VIP', applications: 24, status: 'active', joinedDate: '2026-06-12' },
  { id: 2, name: 'Noah Williams', email: 'noah.williams@example.com', role: 'USER', plan: 'Free', applications: 11, status: 'active', joinedDate: '2026-07-04' },
  { id: 3, name: 'Mia Chen', email: 'mia.chen@example.com', role: 'USER', plan: 'Pro', applications: 7, status: 'blocked', joinedDate: '2026-07-19' },
  { id: 4, name: 'Liam Patel', email: 'liam.patel@example.com', role: 'USER', plan: 'Premium VIP', applications: 31, status: 'active', joinedDate: '2026-08-02' },
  { id: 5, name: 'Sophia Zhang', email: 'sophia.z@example.com', role: 'USER', plan: 'Enterprise', applications: 45, status: 'active', joinedDate: '2026-08-15' },
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  { id: 'PAY-1001', name: 'Ava Morgan', email: 'ava.morgan@example.com', plan: 'Premium VIP', amount: '$29.00', method: 'Credit Card', date: '2026-08-14', status: 'Completed', txnId: 'TXN-849204' },
  { id: 'PAY-1002', name: 'Liam Patel', email: 'liam.patel@example.com', plan: 'Premium VIP', amount: '$29.00', method: 'PayPal', date: '2026-08-21', status: 'Completed', txnId: 'TXN-849312' },
  { id: 'PAY-1003', name: 'Mia Chen', email: 'mia.chen@example.com', plan: 'Pro Plan', amount: '$12.00', method: 'SSLCommerz', date: '2026-08-29', status: 'Completed', txnId: 'TXN-849501' },
  { id: 'PAY-1004', name: 'Sophia Zhang', email: 'sophia.z@example.com', plan: 'Enterprise VIP', amount: '$99.00', method: 'Stripe', date: '2026-09-02', status: 'Completed', txnId: 'TXN-849778' },
];

const DEFAULT_COMPANY_HEALTH: CompanyHealthRecord[] = [
  { name: 'Google', healthStatus: 'Healthy', score: 94, runway: '60+ mo', layoffRisk: 'Low', headcountTrend: 'Growing', lastUpdated: '2026-09-17' },
  { name: 'Stripe', healthStatus: 'Healthy', score: 91, runway: '48+ mo', layoffRisk: 'Low', headcountTrend: 'Growing', lastUpdated: '2026-09-16' },
  { name: 'Amazon', healthStatus: 'Moderate', score: 76, runway: '60+ mo', layoffRisk: 'Moderate', headcountTrend: 'Stable', lastUpdated: '2026-09-15' },
  { name: 'Slack', healthStatus: 'Healthy', score: 85, runway: '36+ mo', layoffRisk: 'Low', headcountTrend: 'Stable', lastUpdated: '2026-09-14' },
  { name: 'Dropbox', healthStatus: 'Moderate', score: 68, runway: '24+ mo', layoffRisk: 'Moderate', headcountTrend: 'Contracting', lastUpdated: '2026-09-12' },
  { name: 'Meta', healthStatus: 'Healthy', score: 89, runway: '60+ mo', layoffRisk: 'Low', headcountTrend: 'Growing', lastUpdated: '2026-09-10' },
  { name: 'Pinterest', healthStatus: 'At Risk', score: 52, runway: '18 mo', layoffRisk: 'High', headcountTrend: 'Contracting', lastUpdated: '2026-09-08' },
  { name: 'Nvidia', healthStatus: 'Healthy', score: 98, runway: '60+ mo', layoffRisk: 'Low', headcountTrend: 'Growing', lastUpdated: '2026-09-17' },
  { name: 'OpenAI', healthStatus: 'Healthy', score: 96, runway: '48+ mo', layoffRisk: 'Low', headcountTrend: 'Growing', lastUpdated: '2026-09-17' },
  { name: 'Canva', healthStatus: 'Healthy', score: 88, runway: '36+ mo', layoffRisk: 'Low', headcountTrend: 'Growing', lastUpdated: '2026-09-11' },
];

// Data Loaders with LocalStorage Persistence
export function getAdminUsers(): AdminUserRecord[] {
  try {
    const data = localStorage.getItem('applytrack_admin_users');
    return data ? JSON.parse(data) : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveAdminUsers(users: AdminUserRecord[]): void {
  localStorage.setItem('applytrack_admin_users', JSON.stringify(users));
}

export function getPaymentHistory(): PaymentRecord[] {
  try {
    const data = localStorage.getItem('applytrack_payment_history');
    return data ? JSON.parse(data) : DEFAULT_PAYMENTS;
  } catch {
    return DEFAULT_PAYMENTS;
  }
}

export function savePaymentHistory(records: PaymentRecord[]): void {
  localStorage.setItem('applytrack_payment_history', JSON.stringify(records));
}

export function getCompanyHealthRecords(): CompanyHealthRecord[] {
  try {
    const data = localStorage.getItem('applytrack_company_health');
    return data ? JSON.parse(data) : DEFAULT_COMPANY_HEALTH;
  } catch {
    return DEFAULT_COMPANY_HEALTH;
  }
}

export function saveCompanyHealthRecords(records: CompanyHealthRecord[]): void {
  localStorage.setItem('applytrack_company_health', JSON.stringify(records));
}

export function getAdminCompanyHealth(company: string): CompanyHealthRecord | undefined {
  const records = getCompanyHealthRecords();
  return records.find((c) => c.name.toLowerCase() === company.trim().toLowerCase());
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const data = localStorage.getItem('applytrack_admin_audit_log');
    if (data) return JSON.parse(data);
  } catch {}
  return [
    { id: 1, timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), operator: 'admin@example.com', action: 'Master Admin console unlocked', type: 'security' },
    { id: 2, timestamp: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), operator: 'admin@example.com', action: 'Approved Premium access for a demo account', type: 'billing' },
  ];
}

export function logAdminAction(action: string, type: 'security' | 'billing' | 'intelligence' | 'system' = 'security'): void {
  const logs = getAuditLogs();
  logs.unshift({
    id: Date.now(),
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    operator: 'admin@example.com',
    action,
    type,
  });
  localStorage.setItem('applytrack_admin_audit_log', JSON.stringify(logs.slice(0, 50)));
  renderAuditLogs();
}

// ==================== 1. USER MANAGEMENT & BLOCK/UNBLOCK ====================
export function renderAdminUsers(): void {
  const body = document.getElementById('adminUsersBody');
  if (!body) return;

  const users = getAdminUsers();
  const query = ((document.getElementById('adminUserSearch') as HTMLInputElement)?.value || '').trim().toLowerCase();
  const filtered = users.filter((u) => !query || `${u.name} ${u.email} ${u.plan}`.toLowerCase().includes(query));

  // Update counter
  const totalCount = document.getElementById('adminTotalUsersCount');
  if (totalCount) totalCount.textContent = String(users.length);

  const activeCount = document.getElementById('adminActiveUsersCount');
  if (activeCount) activeCount.textContent = String(users.filter((u) => u.status === 'active').length);

  if (!filtered.length) {
    body.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-stone-400">No users found matching "${escapeHtml(query)}"</td></tr>`;
    return;
  }

  body.innerHTML = filtered
    .map(
      (user) => `
      <tr class="transition-colors hover:bg-slate-50/70 dark:hover:bg-blue-950/20">
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full ${user.status === 'blocked' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-extrabold'} flex items-center justify-center text-xs flex-shrink-0">
              ${escapeHtml(user.name.charAt(0).toUpperCase())}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <strong class="text-slate-900 dark:text-white text-sm font-extrabold">${escapeHtml(user.name)}</strong>
                ${user.role === 'ADMIN' ? '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-extrabold border border-amber-300">ADMIN</span>' : ''}
              </div>
              <span class="block text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">${escapeHtml(user.email)}</span>
            </div>
          </div>
        </td>

        <td class="py-3.5 px-4">
          <select onchange="window.changeUserPlan(${user.id}, this.value)" class="admin-select">
            <option value="Free" ${user.plan === 'Free' ? 'selected' : ''}>Free Plan</option>
            <option value="Pro" ${user.plan === 'Pro' ? 'selected' : ''}>Pro Plan ($12/mo)</option>
            <option value="Premium VIP" ${user.plan === 'Premium VIP' ? 'selected' : ''}>Premium VIP ($29/mo)</option>
            <option value="Enterprise" ${user.plan === 'Enterprise' ? 'selected' : ''}>Enterprise ($99/mo)</option>
          </select>
        </td>

        <td class="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span class="font-black text-slate-900 dark:text-white text-sm">${user.applications}</span> apps tracked
        </td>

        <td class="py-3.5 px-4">
          <span class="${user.status === 'active' ? 'admin-badge-active' : 'admin-badge-blocked'}">
            ● ${user.status === 'active' ? 'ACTIVE' : 'BLOCKED'}
          </span>
        </td>

        <td class="py-3.5 px-4">
          <div class="flex items-center gap-2">
            <button 
              onclick="window.toggleBlockUser(${user.id})" 
              class="${user.status === 'active' ? 'admin-btn-block' : 'admin-btn-unblock'}">
              ${user.status === 'active' ? '🚫 Block User' : '✅ Unblock'}
            </button>
            <button 
              onclick="window.deleteAdminUser(${user.id})" 
              class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" 
              title="Delete account">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `
    )
    .join('');
}

export function toggleBlockUser(id: number): void {
  const users = getAdminUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return;

  user.status = user.status === 'active' ? 'blocked' : 'active';
  saveAdminUsers(users);
  renderAdminUsers();

  const actionText = user.status === 'blocked' ? `Blocked user ${user.name} (${user.email})` : `Unblocked user ${user.name}`;
  logAdminAction(actionText, 'security');
  showToast(actionText, user.status === 'blocked' ? 'error' : 'success');
}

export function changeUserPlan(id: number, newPlan: string): void {
  const users = getAdminUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return;

  user.plan = newPlan as any;
  saveAdminUsers(users);

  // If this user is the active user in session, synchronize subscription
  const session = getSession();
  if (session?.email?.toLowerCase() === user.email.toLowerCase()) {
    localStorage.setItem(
      'applytrack_ai_subscription',
      JSON.stringify({
        plan: newPlan.toLowerCase().includes('premium') || newPlan.toLowerCase().includes('enterprise') ? 'premium' : 'free',
        status: 'approved',
        method: 'Admin Provisioned',
        updatedAt: new Date().toISOString(),
      })
    );
    updateSubscriptionUI();
  }

  renderAdminUsers();
  renderPaymentHistory();

  const actionText = `Changed ${user.name}'s plan to ${newPlan}`;
  logAdminAction(actionText, 'billing');
  showToast(actionText, 'success');
}

export function deleteAdminUser(id: number): void {
  const users = getAdminUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index < 0) return;

  const target = users[index];
  if (!confirm(`Are you sure you want to permanently delete user account: ${target.name} (${target.email})?`)) {
    return;
  }

  users.splice(index, 1);
  saveAdminUsers(users);
  renderAdminUsers();

  logAdminAction(`Permanently deleted account: ${target.name} (${target.email})`, 'security');
  showToast(`Deleted user ${target.name}`, 'info');
}

export function addNewAdminUser(): void {
  const name = prompt('Enter new user full name:');
  if (!name || !name.trim()) return;

  const email = prompt('Enter new user email address:');
  if (!email || !email.trim()) return;

  const users = getAdminUsers();
  if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
    showToast('A user with that email already exists.', 'error');
    return;
  }

  const newUser: AdminUserRecord = {
    id: generateId(),
    name: name.trim(),
    email: email.trim(),
    role: 'USER',
    plan: 'Free',
    applications: 0,
    status: 'active',
    joinedDate: new Date().toISOString().split('T')[0],
  };

  users.unshift(newUser);
  saveAdminUsers(users);
  renderAdminUsers();

  logAdminAction(`Created new user: ${newUser.name} (${newUser.email})`, 'security');
  showToast(`Created user ${newUser.name}`, 'success');
}

// ==================== 2. PAYMENT HISTORY ====================
export function renderPaymentHistory(): void {
  const body = document.getElementById('paymentHistoryBody');
  if (!body) return;

  const payments = getPaymentHistory();
  const premiumCountBadge = document.getElementById('adminPremiumCount');
  if (premiumCountBadge) {
    premiumCountBadge.textContent = String(payments.filter((p) => p.status === 'Completed').length);
  }

  if (!payments.length) {
    body.innerHTML = `<tr><td colspan="7" class="text-center py-6 text-stone-400">No payment transactions recorded.</td></tr>`;
    return;
  }

  body.innerHTML = payments
    .map(
      (pay) => `
      <tr class="transition-colors hover:bg-slate-50/70 dark:hover:bg-blue-950/20">
        <td class="py-3.5 px-4 font-mono font-extrabold text-blue-700 dark:text-blue-400 text-xs">${escapeHtml(pay.txnId)}</td>
        <td class="py-3.5 px-4">
          <strong class="text-slate-900 dark:text-white font-extrabold block text-sm">${escapeHtml(pay.name)}</strong>
          <span class="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">${escapeHtml(pay.email)}</span>
        </td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-1 rounded-md font-bold text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            ${escapeHtml(pay.plan)}
          </span>
        </td>
        <td class="py-3.5 px-4 font-black text-slate-900 dark:text-white text-sm">${escapeHtml(pay.amount)}</td>
        <td class="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold text-xs">${escapeHtml(pay.method)}</td>
        <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-medium">${escapeHtml(pay.date)}</td>
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
              pay.status === 'Completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
            }">● ${pay.status}</span>
            ${
              pay.status === 'Completed'
                ? `<button onclick="window.refundPayment('${pay.id}')" class="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-extrabold text-xs hover:underline">Refund</button>`
                : ''
            }
          </div>
        </td>
      </tr>
    `
    )
    .join('');
}

export function refundPayment(id: string): void {
  const payments = getPaymentHistory();
  const payment = payments.find((p) => p.id === id);
  if (!payment) return;

  if (!confirm(`Issue refund for ${payment.txnId} (${payment.amount}) to ${payment.name}?`)) {
    return;
  }

  payment.status = 'Refunded';
  savePaymentHistory(payments);
  renderPaymentHistory();

  // Downgrade user plan
  const users = getAdminUsers();
  const user = users.find((u) => u.email.toLowerCase() === payment.email.toLowerCase());
  if (user) {
    user.plan = 'Free';
    saveAdminUsers(users);
    renderAdminUsers();
  }

  logAdminAction(`Issued refund for ${payment.txnId} to ${payment.name} (${payment.amount})`, 'billing');
  showToast(`Refund processed for ${payment.name}`, 'info');
}

// ==================== 3. COMPANY HEALTH CONTROLLER ====================
export function renderCompanyHealthAdmin(): void {
  const container = document.getElementById('companyHealthTableBody');
  if (!container) return;

  const records = getCompanyHealthRecords();

  container.innerHTML = records
    .map(
      (comp) => `
      <tr class="hover:bg-slate-50/70 dark:hover:bg-blue-950/20 transition-colors border-b border-slate-100 dark:border-slate-800/60 text-xs">
        <td class="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white text-sm">
          ${escapeHtml(comp.name)}
        </td>
        <td class="py-3.5 px-4">
          <select onchange="window.updateCompanyHealthStatus('${comp.name}', this.value)" class="admin-select font-bold">
            <option value="Healthy" ${comp.healthStatus === 'Healthy' ? 'selected' : ''}>🟢 Healthy (Stable Growth)</option>
            <option value="Moderate" ${comp.healthStatus === 'Moderate' ? 'selected' : ''}>🟡 Moderate (Standard Risk)</option>
            <option value="At Risk" ${comp.healthStatus === 'At Risk' ? 'selected' : ''}>🔴 At Risk (Layoffs/Budget Cut)</option>
            <option value="Hiring Freeze" ${comp.healthStatus === 'Hiring Freeze' ? 'selected' : ''}>❄️ Hiring Freeze (Recession)</option>
          </select>
        </td>
        <td class="py-3.5 px-4">
          <div class="flex items-center gap-2">
            <span class="font-black text-slate-900 dark:text-white text-sm">${comp.score}/100</span>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value="${comp.score}" 
              class="w-20 accent-blue-600 cursor-pointer" 
              onchange="window.updateCompanyHealthScore('${comp.name}', this.value)"
            >
          </div>
        </td>
        <td class="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-extrabold">${escapeHtml(comp.runway)}</td>
        <td class="py-3.5 px-4">
          <span class="px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
            comp.layoffRisk === 'Low'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
              : comp.layoffRisk === 'Moderate'
              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800'
          }">${comp.layoffRisk}</span>
        </td>
        <td class="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs font-mono">${escapeHtml(comp.lastUpdated)}</td>
      </tr>
    `
    )
    .join('');
}

export function updateCompanyHealthStatus(company: string, newStatus: any): void {
  const records = getCompanyHealthRecords();
  const comp = records.find((c) => c.name.toLowerCase() === company.toLowerCase());
  if (!comp) return;

  comp.healthStatus = newStatus;
  comp.lastUpdated = new Date().toISOString().split('T')[0];

  // Adjust score suggestion based on status
  if (newStatus === 'Healthy' && comp.score < 80) comp.score = 88;
  if (newStatus === 'Hiring Freeze' && comp.score > 40) comp.score = 35;
  if (newStatus === 'At Risk' && comp.score > 55) comp.score = 50;

  saveCompanyHealthRecords(records);
  renderCompanyHealthAdmin();

  logAdminAction(`Changed company health status for ${company} to ${newStatus}`, 'intelligence');
  showToast(`Updated ${company} health status to ${newStatus}`, 'success');
}

export function updateCompanyHealthScore(company: string, newScore: string): void {
  const records = getCompanyHealthRecords();
  const comp = records.find((c) => c.name.toLowerCase() === company.toLowerCase());
  if (!comp) return;

  comp.score = parseInt(newScore, 10);
  comp.lastUpdated = new Date().toISOString().split('T')[0];
  saveCompanyHealthRecords(records);
  renderCompanyHealthAdmin();

  logAdminAction(`Adjusted stability score for ${company} to ${newScore}/100`, 'intelligence');
}

export function resetCompanyHealthToDefaults(): void {
  saveCompanyHealthRecords(DEFAULT_COMPANY_HEALTH);
  renderCompanyHealthAdmin();
  logAdminAction('Reset all company health records to baseline defaults', 'intelligence');
  showToast('Company health records restored to defaults', 'info');
}

// ==================== 4. PREMIUM APPROVALS ====================
export function getSubscriptionRequest(): any {
  try {
    return JSON.parse(localStorage.getItem('applytrack_ai_subscription') || 'null');
  } catch {
    return null;
  }
}

export function renderPremiumApprovals(): void {
  const panel = document.getElementById('premiumApprovalPanel');
  if (!panel) return;

  const request = getSubscriptionRequest();

  if (request?.status === 'pending' && request.requestedPlan === 'premium') {
    const requester = request.requestedBy || {};
    panel.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <div>
          <h4 class="font-extrabold text-base text-slate-900 dark:text-white">Pending Premium Access Request</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">User submitted upgrade verification.</p>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 text-xs font-extrabold animate-pulse">PENDING</span>
      </div>
      <div class="border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50/70 dark:bg-[#152033]/50">
        <div class="flex items-center justify-between gap-3">
          <div>
            <strong class="text-slate-900 dark:text-white text-sm font-extrabold">${escapeHtml(requester.name || 'Platform User')}</strong>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${escapeHtml(requester.email || 'user@example.com')} · Payment Method: ${escapeHtml(request.method || 'Card')}</p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button class="btn-primary text-xs py-1.5 px-3.5 font-bold shadow-sm hover:shadow" onclick="window.approvePremiumRequest()">Approve & Grant VIP</button>
            <button class="btn-outline text-xs py-1.5 px-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 border-slate-300 dark:border-slate-700" onclick="window.rejectPremiumRequest()">Reject</button>
          </div>
        </div>
      </div>`;
  } else {
    panel.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <h4 class="font-extrabold text-base text-slate-900 dark:text-white">Premium Approval Queue</h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No pending upgrade requests. All user requests processed.</p>
        </div>
        <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-extrabold">ALL CLEAR</span>
      </div>`;
  }
}

export function approvePremiumRequest(): void {
  const request = getSubscriptionRequest();
  if (!request) return;

  const approved = {
    ...request,
    plan: 'premium',
    status: 'approved',
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('applytrack_ai_subscription', JSON.stringify(approved));

  // Add to payment history
  const payments = getPaymentHistory();
  payments.unshift({
    id: `PAY-${Date.now().toString().slice(-4)}`,
    name: request.requestedBy?.name || 'Active User',
    email: request.requestedBy?.email || 'user@example.com',
    plan: 'Premium VIP',
    amount: '$29.00',
    method: request.method || 'Credit Card',
    date: new Date().toISOString().split('T')[0],
    status: 'Completed',
    txnId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
  });
  savePaymentHistory(payments);

  updateSubscriptionUI();
  renderPremiumApprovals();
  renderPaymentHistory();

  logAdminAction(`Approved Premium VIP access for ${request.requestedBy?.email || 'user'}`, 'billing');
  showToast('Approved Premium access! User upgraded to VIP.', 'success');
}

export function rejectPremiumRequest(): void {
  localStorage.removeItem('applytrack_ai_subscription');
  renderPremiumApprovals();
  logAdminAction('Rejected pending premium subscription request', 'billing');
  showToast('Subscription request rejected.', 'info');
}

// ==================== 5. EMERGENCY CONTROLS & AUDIT TRAIL ====================
let maintenanceMode = false;

export function toggleMaintenanceMode(): void {
  maintenanceMode = !maintenanceMode;
  let banner = document.getElementById('platformMaintenanceBanner');

  if (maintenanceMode) {
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'platformMaintenanceBanner';
      banner.className = 'w-full bg-amber-500 text-stone-900 px-4 py-2 text-center text-xs font-bold sticky top-0 z-[60] flex items-center justify-center gap-2 shadow';
      banner.innerHTML = `
        <span>⚠️ PLATFORM ALERT: System undergoing database optimization. Live syncing remains active.</span>
        <button onclick="window.toggleMaintenanceMode()" class="underline text-stone-950 ml-2">Dismiss as Admin</button>
      `;
      document.body.prepend(banner);
    }
    banner.classList.remove('hidden');
    logAdminAction('Enabled platform maintenance alert banner', 'system');
    showToast('Platform Maintenance Mode enabled', 'info');
  } else {
    if (banner) banner.classList.add('hidden');
    logAdminAction('Disabled platform maintenance mode', 'system');
    showToast('Maintenance Mode deactivated', 'success');
  }

  const btn = document.getElementById('adminMaintenanceBtn');
  if (btn) {
    btn.textContent = maintenanceMode ? 'Deactivate Maintenance Mode' : 'Activate Maintenance Mode';
  }
}

export function triggerAdminSimWave(): void {
  const syncFn = (window as any).simulateEmailSync;
  if (typeof syncFn === 'function') {
    syncFn();
    logAdminAction('Triggered recruitment simulated influx wave across pipeline', 'intelligence');
  }
}

export function renderAuditLogs(): void {
  const list = document.getElementById('adminAuditLogList');
  if (!list) return;

  const logs = getAuditLogs();
  if (!logs.length) {
    list.innerHTML = '<p class="text-xs text-stone-400 py-4 text-center">No audit entries recorded.</p>';
    return;
  }

  list.innerHTML = logs
    .slice(0, 15)
    .map(
      (log) => `
      <div class="flex items-start justify-between gap-3 py-2.5 border-b border-slate-100 dark:border-slate-800/60 text-xs">
        <div class="flex items-start gap-2.5">
          <span class="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0"></span>
          <div>
            <span class="font-bold text-slate-800 dark:text-slate-200">${escapeHtml(log.action)}</span>
            <span class="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">By ${escapeHtml(log.operator)} · ${escapeHtml(log.type.toUpperCase())}</span>
          </div>
        </div>
        <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono font-medium flex-shrink-0">${escapeHtml(log.timestamp)}</span>
      </div>
    `
    )
    .join('');
}

export function clearAdminAuditLog(): void {
  if (!confirm('Clear the admin audit trail?')) return;
  localStorage.setItem('applytrack_admin_audit_log', JSON.stringify([]));
  renderAuditLogs();
  showToast('Audit log cleared.', 'info');
}

export function exitAdminMode(): void {
  // Revert back to guest or standard session
  saveSession({ name: 'Standard User', email: 'user@applytrack.local', provider: 'guest', role: 'USER' });
  const switchFn = (window as any).switchView;
  if (typeof switchFn === 'function') {
    switchFn('dashboard');
  }
  document.getElementById('adminNavLink')?.classList.add('hidden');
  showToast('Exited Admin Mode. Standard workspace active.', 'info');
}

// Global View Initialization
export function renderAdminView(): void {
  renderAdminUsers();
  renderPaymentHistory();
  renderCompanyHealthAdmin();
  renderPremiumApprovals();
  renderAuditLogs();
}
