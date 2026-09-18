export function addBootScreen(): void {
  if (document.getElementById('uxBootScreen')) return;
  const el = document.createElement('div');
  el.id = 'uxBootScreen';
  el.innerHTML =
    '<div class="ux-boot-inner" aria-label="Loading ApplyTrack AI"><div class="ux-boot-mark">AT</div><div style="font-weight:800;font-size:14px;margin-bottom:12px;">ApplyTrack AI</div><div class="ux-boot-line"><span></span></div></div>';
  document.body.prepend(el);
  requestAnimationFrame(() => setTimeout(() => el.classList.add('is-done'), 260));
  setTimeout(() => el.remove(), 900);
}

export function setupScrollPolish(): void {
  const landing = document.querySelector('.landing-nav');
  const topbar = document.querySelector('.app-topbar');
  const update = () => {
    const y = window.scrollY || 0;
    landing?.classList.toggle('ux-scrolled', y > 8);
    topbar?.classList.toggle('ux-scrolled', y > 8);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

export function setupMobileSidebar(): void {
  const sidebar = document.getElementById('sidebar');
  const topbar = document.querySelector('.app-topbar');
  const existingBtn = document.getElementById('uxMobileMenu');
  if (!sidebar || !topbar || existingBtn) return;

  const mobileBtn = document.createElement('button');
  mobileBtn.id = 'uxMobileMenu';
  mobileBtn.type = 'button';
  mobileBtn.setAttribute('aria-label', 'Open navigation');
  mobileBtn.innerHTML = '☰';
  mobileBtn.onclick = () => sidebar.classList.toggle('open');

  const backdrop = document.createElement('div');
  backdrop.id = 'uxSidebarBackdrop';
  backdrop.onclick = () => sidebar.classList.remove('open');
  document.body.appendChild(backdrop);

  const brand = topbar.querySelector('.brand-button');
  if (brand && brand.parentNode) {
    brand.parentNode.insertBefore(mobileBtn, brand);
  }

  document.querySelectorAll('#sidebarNav a').forEach((a) => {
    a.addEventListener('click', () => sidebar.classList.remove('open'));
  });
}

export function setupOutsideClick(): void {
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const profile = document.getElementById('profileDropdown');
    const wrap = document.querySelector('.profile-menu');
    if (profile && wrap && !wrap.contains(target)) profile.classList.remove('open');

    const notif = document.getElementById('nlNotificationPanel');
    const notifWrap = document.querySelector('.nl-notification-wrap');
    if (notif && notifWrap && !notifWrap.contains(target)) notif.classList.remove('open');
  });
}

export function setupNavigationObserver(): void {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  nav.querySelectorAll('a[data-view]').forEach((link) => {
    link.addEventListener('click', () => {
      setTimeout(() => {
        const view = (link as HTMLElement).dataset.view;
        document.title =
          view === 'dashboard'
            ? 'ApplyTrack AI — Dashboard'
            : `ApplyTrack AI — ${view?.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())}`;
      }, 0);
    });
  });
}

export function exposeUxStatus(): void {
  (window as any).ApplyTrackUX = {
    version: 'Next-Level Full-Stack TypeScript v2',
    features: [
      'TypeScript strict compilation',
      'GraphQL schema & queries',
      'PostgreSQL via Prisma ORM',
      'Express REST export/import routes',
      'premium motion layer',
      'responsive mobile navigation',
      'keyboard-first command access',
      'career goals & weekly insights',
      'interview prep hub',
      'PWA installable',
      'auto-backup snapshots',
      'CSV export',
      'accessibility focus states',
      'scroll-aware navigation',
      'boot transition',
    ],
  };
}
