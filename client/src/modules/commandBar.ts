import { isAdmin } from './auth';
import { switchView } from './dashboard';
import { state } from './state';
import { escapeHtml, showToast } from './utils';

export function openCommandPalette(): void {
  document.getElementById('nlCommandBar')?.classList.add('open');
  const input = document.getElementById('nlCommandInput') as HTMLInputElement | null;
  if (input) {
    input.value = '';
    setTimeout(() => input.focus(), 30);
  }
  renderCommandResults();
}

export function closeCommandPalette(): void {
  document.getElementById('nlCommandBar')?.classList.remove('open');
}

export function openShortcutsModal(): void {
  document.getElementById('nlShortcutsModal')?.classList.add('open');
}

export function closeShortcutsModal(): void {
  document.getElementById('nlShortcutsModal')?.classList.remove('open');
}

function commandItems(): Array<[string, string, string, string]> {
  const nav: Array<[string, string, string, string]> = [
    ['⌂', 'Dashboard', 'Open command center', 'dashboard'],
    ['▤', 'Applications', 'View and manage applications', 'applications'],
    ['▦', 'Kanban', 'Open pipeline board', 'kanban'],
    ['▣', 'Calendar', 'Review important dates', 'calendar'],
    ['↗', 'Analytics', 'Inspect performance', 'analytics'],
    ['◎', 'Career Goals', 'Weekly targets & interview prep', 'goals'],
    ['✦', 'AI Career Tools', 'Open AI workspace', 'ai-tools'],
    ['✉', 'Email Import', 'Review detected recruitment emails', 'email-import'],
    ['⚙', 'Settings', 'Manage workspace settings', 'settings'],
  ];

  if (isAdmin()) {
    nav.push(['◆', 'Admin Dashboard', 'Manage platform and monitor systems', 'admin']);
  }

  const apps = state.applications.slice(0, 12).map((a) => ['◉', a.title || 'Application', a.company || 'Application', 'application:' + a.id] as [string, string, string, string]);
  return [...nav, ...apps];
}

export function renderCommandResults(): void {
  const host = document.getElementById('nlCommandResults');
  const input = document.getElementById('nlCommandInput') as HTMLInputElement | null;
  if (!host || !input) return;

  const q = input.value.trim().toLowerCase();
  const items = commandItems().filter((x) => !q || x[1].toLowerCase().includes(q) || x[2].toLowerCase().includes(q));

  host.innerHTML = items.length
    ? items
        .map(
          (x, i) => `
        <button class="nl-command-item ${i === 0 ? 'active' : ''}" onclick="window.executeCommand('${x[3].replace(/'/g, "\\'")}')">
            <span class="nl-command-icon">${x[0]}</span>
            <span>
                <strong style="display:block;font-size:12px;">${escapeHtml(x[1])}</strong>
                <span style="font-size:10px;color:#a8a29e;">${escapeHtml(x[2])}</span>
            </span>
            ${i === 0 ? '<span class="nl-command-meta">Enter</span>' : ''}
        </button>
      `
        )
        .join('')
    : `<div class="nl-empty">No matching commands or applications.</div>`;
}

export function executeCommand(command: string): void {
  closeCommandPalette();
  if (command.startsWith('application:')) {
    const id = parseInt(command.slice(12), 10);
    const app = state.applications.find((a) => a.id === id);
    if (app) {
      switchView('applications');
      setTimeout(() => showToast(`${app.title} · ${app.company}`, 'info'), 150);
    }
    return;
  }
  switchView(command);
}

export function setupKeyboardShortcuts(): void {
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const typing =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
      return;
    }
    if (e.key === '?' && !typing) {
      e.preventDefault();
      openShortcutsModal();
      return;
    }
    if (e.key === 'Escape') {
      closeCommandPalette();
      closeShortcutsModal();
      (window as any).closeAuth?.();
      document.getElementById('nlNotificationPanel')?.classList.remove('open');
      document.getElementById('profileDropdown')?.classList.remove('open');
      document.querySelectorAll('.modal-panel').forEach((m) => m.parentElement?.classList.add('hidden'));
    }
    if (e.key === 'Enter' && document.getElementById('nlCommandBar')?.classList.contains('open')) {
      const first = document.querySelector('#nlCommandResults .nl-command-item') as HTMLElement | null;
      if (first) first.click();
    }
    if (!typing && e.key.toLowerCase() === 'n' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      (window as any).openAddApplicationModal?.();
    }
  });

  let pendingNavKey: number | null = null;
  document.addEventListener('keydown', (e) => {
    const target = e.target as HTMLElement;
    const typing =
      target &&
      (target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable);

    if (typing) return;
    if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey) {
      pendingNavKey = Date.now();
      return;
    }
    if (pendingNavKey && Date.now() - pendingNavKey < 1200) {
      const map: Record<string, string> = {
        d: 'dashboard',
        a: 'applications',
        k: 'kanban',
        g: 'goals',
        c: 'calendar',
        s: 'settings',
      };
      const view = map[e.key.toLowerCase()];
      if (view) {
        e.preventDefault();
        switchView(view);
      }
      pendingNavKey = null;
    } else if (pendingNavKey) {
      pendingNavKey = null;
    }
  });
}
