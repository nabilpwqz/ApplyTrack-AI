import './styles/main.css';

import {
  addNewAdminUser,
  approvePremiumRequest,
  changeUserPlan,
  clearAdminAuditLog,
  deleteAdminUser,
  exitAdminMode,
  refundPayment,
  rejectPremiumRequest,
  renderAdminUsers,
  renderAdminView,
  renderCompanyHealthAdmin,
  renderPaymentHistory,
  renderPremiumApprovals,
  resetCompanyHealthToDefaults,
  toggleBlockUser,
  toggleMaintenanceMode,
  triggerAdminSimWave,
  updateCompanyHealthScore,
  updateCompanyHealthStatus,
} from './modules/admin';
import {
  calculateCompanyHealth,
  calculateInterviewScore,
  calculateJobMatch,
  calculateSalaryAnalysis,
  closeCompanyHealth,
  closeFollowUpEmail,
  closeInterviewCalculator,
  closeJobMatch,
  closeSalaryNegotiation,
  copyGeneratedEmail,
  copyNegotiationScript,
  copyResumeBullets,
  generateFollowUpEmail,
  openCompanyHealth,
  openFollowUpEmail,
  openInterviewCalculator,
  openJobMatch,
  openSalaryNegotiation,
  selectSubjectOption,
} from './modules/aiTools';
import { renderAnalytics } from './modules/analytics';
import {
  closeAddAppModal,
  closeAppDetailsModal,
  deleteApplication,
  openAddApplicationModal,
  openAppDetails,
  openEditApplication,
  renderApplicationsTable,
  saveApplication,
} from './modules/applications';
import {
  closeAuth,
  enterApp,
  focusPipelineStage,
  getSession,
  goHome,
  handleAuthSubmit,
  handleForgotPassword,
  handleGoogleAuth,
  handleGuestAuth,
  initFirebaseAuth,
  isAdmin,
  loadTheme,
  openAuth,
  resetGoogleAuthButton,
  scrollToSection,
  setAuthMode,
  setTheme,
  signOut,
  toggleProfileMenu,
} from './modules/auth';
import { addQuickBriefNote, renderBrief } from './modules/brief';
import {
  changeCalendarMonth,
  closeAddCalendarEventModal,
  closeDayDetailModal,
  deleteCalendarEvent,
  exportCalendarICS,
  handleCalendarAppSelect,
  jumpToToday,
  navigateCalendar,
  openAddCalendarEventModal,
  openDayDetailModal,
  renderCalendar,
  saveCalendarEvent,
  setCalendarFilter,
  setCalendarViewMode,
} from './modules/calendar';
import {
  closeCommandPalette,
  closeShortcutsModal,
  executeCommand,
  openCommandPalette,
  openShortcutsModal,
  renderCommandResults,
  setupKeyboardShortcuts,
} from './modules/commandBar';
import {
  markNotificationsRead,
  renderDashboard,
  renderNextLevelDashboard,
  renderNotifications,
  switchView,
  toggleNotifications,
  updateNavBadges,
} from './modules/dashboard';
import {
  acceptEmailImport,
  closeRefreshPopup,
  dismissEmailImport,
  handleRefreshAndReview,
  importEmailApp,
  renderEmailImports,
  showRefreshPopup,
  simulateEmailSync,
} from './modules/emailImport';
import {
  renderGoalsView,
  renderInterviewPrepList,
  saveCareerGoals,
  setGoalRing,
  togglePrepItem,
} from './modules/goals';
import {
  handleKanbanDragStart,
  handleKanbanDrop,
  renderKanban,
} from './modules/kanban';
import {
  closeContactModal,
  openContactModal,
  renderNetwork,
  saveContact,
} from './modules/network';
import { renderOfferDesk } from './modules/offers';
import {
  exportData,
  exportDataCSV,
  getSubscription,
  importDataFile,
  installPWA,
  renderBackupList,
  renderBillingTransactions,
  renderSettingsView,
  resetAllData,
  restoreBackup,
  saveSubscription,
  selectPaymentMethod,
  selectSubscriptionPlan,
  updateBillingAmount,
  updateSubscriptionUI,
} from './modules/settings';
import { createRuntimeProfile } from './modules/architecture';
import { seedData, state, syncWithBackend } from './modules/state';
import {
  closeStoryModal,
  openStoryModal,
  renderStoryBank,
  saveStory,
} from './modules/stories';
import { showToast } from './modules/utils';
import {
  addBootScreen,
  exposeUxStatus,
  setupMobileSidebar,
  setupNavigationObserver,
  setupOutsideClick,
  setupScrollPolish,
} from './modules/uxController';

// Expose all interactive functions to window for HTML element handlers
Object.assign(window, {
  openAuth,
  closeAuth,
  setAuthMode,
  handleAuthSubmit,
  handleForgotPassword,
  handleGoogleAuth,
  handleGuestAuth,
  enterApp,
  signOut,
  goHome,
  scrollToSection,
  focusPipelineStage,
  toggleProfileMenu,
  setTheme,
  showToast,
  switchView,
  toggleNotifications,
  markNotificationsRead,
  openCommandPalette,
  closeCommandPalette,
  renderCommandResults,
  executeCommand,
  openShortcutsModal,
  closeShortcutsModal,
  openAddApplicationModal,
  openEditApplication,
  closeAddAppModal,
  saveApplication,
  deleteApplication,
  openAppDetails,
  closeAppDetailsModal,
  renderApplicationsTable,
  renderKanban,
  handleKanbanDragStart,
  handleKanbanDrop,
  renderCalendar,
  changeCalendarMonth,
  navigateCalendar,
  jumpToToday,
  setCalendarViewMode,
  setCalendarFilter,
  openDayDetailModal,
  closeDayDetailModal,
  openAddCalendarEventModal,
  closeAddCalendarEventModal,
  handleCalendarAppSelect,
  saveCalendarEvent,
  deleteCalendarEvent,
  exportCalendarICS,
  renderAnalytics,
  renderBrief,
  addQuickBriefNote,
  openContactModal,
  closeContactModal,
  saveContact,
  renderNetwork,
  renderOfferDesk,
  openStoryModal,
  closeStoryModal,
  saveStory,
  renderStoryBank,
  renderGoalsView,
  saveCareerGoals,
  togglePrepItem,
  renderInterviewPrepList,
  openJobMatch,
  closeJobMatch,
  calculateJobMatch,
  openInterviewCalculator,
  closeInterviewCalculator,
  calculateInterviewScore,
  openCompanyHealth,
  closeCompanyHealth,
  calculateCompanyHealth,
  openSalaryNegotiation,
  closeSalaryNegotiation,
  calculateSalaryAnalysis,
  copyNegotiationScript,
  openFollowUpEmail,
  closeFollowUpEmail,
  generateFollowUpEmail,
  copyGeneratedEmail,
  copyResumeBullets,
  selectSubjectOption,
  renderEmailImports,
  acceptEmailImport,
  importEmailApp,
  dismissEmailImport,
  simulateEmailSync,
  showRefreshPopup,
  closeRefreshPopup,
  handleRefreshAndReview,
  selectSubscriptionPlan,
  selectPaymentMethod,
  updateBillingAmount,
  saveSubscription,
  renderBackupList,
  restoreBackup,
  exportData,
  exportDataCSV,
  importDataFile,
  resetAllData,
  installPWA,
  renderSettingsView,
  renderAdminUsers,
  toggleBlockUser,
  changeUserPlan,
  deleteAdminUser,
  addNewAdminUser,
  renderPaymentHistory,
  refundPayment,
  renderCompanyHealthAdmin,
  updateCompanyHealthStatus,
  updateCompanyHealthScore,
  resetCompanyHealthToDefaults,
  renderPremiumApprovals,
  approvePremiumRequest,
  rejectPremiumRequest,
  toggleMaintenanceMode,
  triggerAdminSimWave,
  clearAdminAuditLog,
  exitAdminMode,
  renderAdminView,
});

const runtime = createRuntimeProfile();

runtime.registerLifecycleHook(() => {
  (window as typeof window & { __APP_RUNTIME__?: unknown }).__APP_RUNTIME__ = runtime.snapshot;
  document.documentElement.dataset.appEnvironment = runtime.snapshot.environment;
  document.documentElement.dataset.appVersion = runtime.snapshot.version;
});

function init(): void {
  runtime.bootstrap();

  loadTheme();
  seedData();
  renderDashboard();
  updateNavBadges();
  renderBackupList();

  // Currency listener
  document.getElementById('billingCurrency')?.addEventListener('change', updateBillingAmount);
  updateBillingAmount();

  // Setup sidebar navigation links
  document.querySelectorAll('.sidebar-link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = (link as HTMLElement).dataset.view;
      if (view) switchView(view);
    });
  });

  // Mobile sidebar triggers
  document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebarOverlay')?.classList.toggle('hidden');
  });
  document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebarOverlay')?.classList.add('hidden');
  });

  // Filter input listeners
  document.getElementById('appSearchInput')?.addEventListener('input', renderApplicationsTable);
  document.getElementById('statusFilter')?.addEventListener('change', renderApplicationsTable);
  document.getElementById('priorityFilter')?.addEventListener('change', renderApplicationsTable);
  document.getElementById('networkSearch')?.addEventListener('input', renderNetwork);
  document.getElementById('networkFilter')?.addEventListener('change', renderNetwork);
  document.getElementById('adminUserSearch')?.addEventListener('input', renderAdminUsers);

  // Resize listener for charts
  window.addEventListener('resize', () => {
    if (state.currentView === 'analytics') renderAnalytics();
  });

  // Render notifications
  renderNotifications();

  // Attempt async sync with live GraphQL server in background
  syncWithBackend().then(() => {
    if (state.currentView === 'dashboard') renderDashboard();
    updateNavBadges();
  });

  // Initialize Firebase Auth listener and session
  initFirebaseAuth();
  const session = getSession();
  if (session) {
    enterApp();
  } else {
    document.getElementById('landingPage')?.classList.remove('app-shell-hidden');
    document.getElementById('appShell')?.classList.add('app-shell-hidden');
  }

  console.log('🚀 ApplyTrack AI Studio initialized with TypeScript, GraphQL & Firebase');
}

// Ready bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    addBootScreen();
    setupScrollPolish();
    setupMobileSidebar();
    setupKeyboardShortcuts();
    setupOutsideClick();
    setupNavigationObserver();
    exposeUxStatus();
  });
} else {
  init();
  addBootScreen();
  setupScrollPolish();
  setupMobileSidebar();
  setupKeyboardShortcuts();
  setupOutsideClick();
  setupNavigationObserver();
  exposeUxStatus();
}
