import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from '../firebase';
import { UserSession } from '../types';
import { state } from './state';
import { showToast } from './utils';

const AUTH_KEY = 'applytrack_ai_session';
let authMode: 'login' | 'signup' | 'reset' = 'login';
let googleAuthTimer: any = null;

type AuthFlowStage = 'idle' | 'validating' | 'syncing' | 'complete' | 'failed';

interface AuthExecutionContext {
  email: string;
  provider: 'email' | 'google';
  mode: 'login' | 'signup' | 'reset';
  role: 'USER' | 'ADMIN';
  stage: AuthFlowStage;
}

const authFlow: AuthExecutionContext = {
  email: '',
  provider: 'email',
  mode: 'login',
  role: 'USER',
  stage: 'idle',
};

function resolveRoleFromEmail(email: string): 'USER' | 'ADMIN' {
  return email.toLowerCase().endsWith('@example.com') || email.toLowerCase() === 'admin@example.com' ? 'ADMIN' : 'USER';
}

function normalizeAuthPipeline(email: string, provider: 'email' | 'google', mode: 'login' | 'signup' | 'reset'): AuthExecutionContext {
  const normalizedEmail = (email || '').trim();
  return {
    email: normalizedEmail,
    provider,
    mode,
    role: resolveRoleFromEmail(normalizedEmail),
    stage: 'validating',
  };
}

export function getSession(): UserSession | null {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveSession(user: UserSession): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  state.session = user;
}

export function formatAuthError(error: any): string {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials or create an account.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Switch to Log in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Google sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Redirecting you to Google...';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled in Firebase Console. Please go to Firebase Console > Authentication > Sign-in method, click Google, toggle Enable, and Save.';
    case 'auth/unauthorized-domain':
      return `Domain "${currentHost}" is not authorized. In Firebase Console (Authentication > Settings > Authorized domains), add "${currentHost}".`;
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email address using a different sign-in method.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a few minutes before trying again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

export function openAuth(mode: 'login' | 'signup' | 'reset' = 'login'): void {
  setAuthMode(mode);
  const errorEl = document.getElementById('authErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    errorEl.style.color = '#ef4444';
  }
  const overlay = document.getElementById('authOverlay');
  if (overlay) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
  }
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const input = document.getElementById(mode === 'signup' ? 'authName' : 'authEmail') as HTMLInputElement | null;
    input?.focus();
  }, 60);
}

export function resetGoogleAuthButton(): void {
  const button = document.getElementById('googleAuthButton');
  const icon = document.getElementById('googleButtonIcon');
  const label = document.getElementById('googleButtonLabel');
  if (!button) return;
  button.classList.remove('is-loading');
  if (icon?.dataset.defaultMarkup) icon.innerHTML = icon.dataset.defaultMarkup;
  if (label?.dataset.defaultText) label.textContent = label.dataset.defaultText;
}

export function closeAuth(): void {
  if (googleAuthTimer) {
    clearTimeout(googleAuthTimer);
    googleAuthTimer = null;
  }
  resetGoogleAuthButton();
  const errorEl = document.getElementById('authErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    errorEl.style.color = '#ef4444';
  }
  const overlay = document.getElementById('authOverlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
  }
  document.body.style.overflow = '';
}

export function setAuthMode(mode: 'login' | 'signup' | 'reset'): void {
  authMode = mode;
  const signup = mode === 'signup';
  const reset = mode === 'reset';

  const errorEl = document.getElementById('authErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    errorEl.style.color = '#ef4444';
  }

  document.querySelector('#authOverlay .auth-card')?.classList.toggle('is-signup', signup);

  document.getElementById('loginTab')?.classList.toggle('active', mode === 'login');
  document.getElementById('signupTab')?.classList.toggle('active', mode === 'signup');

  const nameField = document.getElementById('nameField');
  if (nameField) nameField.style.display = signup ? 'block' : 'none';

  const passwordField = document.getElementById('passwordField');
  if (passwordField) passwordField.style.display = reset ? 'none' : 'block';

  const passwordInput = document.getElementById('authPassword') as HTMLInputElement | null;
  if (passwordInput) passwordInput.required = !reset;

  const confirmField = document.getElementById('confirmPasswordField');
  if (confirmField) confirmField.style.display = signup ? 'block' : 'none';

  const forgotWrap = document.getElementById('forgotWrap');
  if (forgotWrap) forgotWrap.style.display = mode === 'login' ? 'flex' : 'none';

  const authTitle = document.getElementById('authTitle');
  if (authTitle) {
    authTitle.textContent = reset
      ? 'Reset password'
      : signup
      ? 'Create account'
      : 'Welcome back';
  }

  const authSubtitle = document.getElementById('authSubtitle');
  if (authSubtitle) {
    authSubtitle.textContent = reset
      ? 'Enter your email to receive a password reset link.'
      : signup
      ? 'Open a workspace in under a minute.'
      : 'Enter your workspace.';
  }

  const authSubmit = document.getElementById('authSubmit');
  if (authSubmit) {
    authSubmit.textContent = reset
      ? 'Send reset link'
      : signup
      ? 'Create account'
      : 'Log in';
  }

  const authSwitch = document.getElementById('authSwitch');
  if (authSwitch) {
    if (reset) {
      authSwitch.innerHTML = 'Remembered your password? <button type="button" id="switchToLoginBtn">Log in</button>';
    } else if (signup) {
      authSwitch.innerHTML = 'Have an account? <button type="button" id="switchToLoginBtn">Log in</button>';
    } else {
      authSwitch.innerHTML = 'New here? <button type="button" id="switchToSignupBtn">Create an account</button>';
    }

    document.getElementById('switchToLoginBtn')?.addEventListener('click', () => setAuthMode('login'));
    document.getElementById('switchToSignupBtn')?.addEventListener('click', () => setAuthMode('signup'));
  }

  const confirmInput = document.getElementById('authConfirmPassword') as HTMLInputElement | null;
  if (confirmInput) confirmInput.required = signup;
}

export async function handleForgotPassword(event?: Event): Promise<void> {
  if (event) event.preventDefault();
  const errorEl = document.getElementById('authErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    errorEl.style.color = '#ef4444';
  }

  const emailInput = document.getElementById('authEmail') as HTMLInputElement | null;
  const email = emailInput?.value.trim() || '';

  // If email field is not filled yet, switch to reset mode and focus email input
  if (!email) {
    setAuthMode('reset');
    emailInput?.focus();
    showToast('Enter your email to receive a password reset link.', 'info');
    return;
  }

  // If email is already typed, send reset email directly
  try {
    showToast('Sending password reset email...', 'info');
    await sendPasswordResetEmail(auth, email);
    const successMsg = `Password reset link sent to ${email}. Please check your inbox or spam folder.`;
    if (errorEl) {
      errorEl.style.color = '#34d399';
      errorEl.textContent = successMsg;
      errorEl.style.display = 'block';
    }
    showToast(`Password reset link sent to ${email}!`, 'success');
  } catch (err: any) {
    console.error('Firebase Password Reset error:', err);
    const friendlyMsg = formatAuthError(err);
    if (errorEl) {
      errorEl.style.color = '#ef4444';
      errorEl.textContent = friendlyMsg;
      errorEl.style.display = 'block';
    }
    showToast(friendlyMsg, 'error');
  }
}

export async function handleAuthSubmit(event: Event): Promise<void> {
  event.preventDefault();
  const errorEl = document.getElementById('authErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    errorEl.style.color = '#ef4444';
  }

  const emailInput = document.getElementById('authEmail') as HTMLInputElement | null;
  const passwordInput = document.getElementById('authPassword') as HTMLInputElement | null;
  const nameInput = document.getElementById('authName') as HTMLInputElement | null;

  const email = emailInput?.value.trim() || '';
  const password = passwordInput?.value || '';
  const name = nameInput?.value.trim() || 'Demo User';

  if (!email) {
    const msg = 'Please enter your email address.';
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
    showToast(msg, 'error');
    return;
  }

  // Check if this account has been blocked by the admin
  try {
    const adminUsersRaw = localStorage.getItem('applytrack_admin_users');
    if (adminUsersRaw) {
      const usersList = JSON.parse(adminUsersRaw);
      const matched = usersList.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
      if (matched && matched.status === 'blocked') {
        const blockMsg = 'This account has been suspended by the administrator. Contact admin@example.com for assistance.';
        if (errorEl) {
          errorEl.textContent = blockMsg;
          errorEl.style.display = 'block';
        }
        showToast(blockMsg, 'error');
        return;
      }
    }
  } catch (e) {}

  // Dedicated Master Admin Login (email: admin@example.com, password: change-me-admin-password)
  if (email.toLowerCase() === 'admin@example.com') {
    if (password === 'change-me-admin-password') {
      const adminSession: UserSession = {
        name: 'System Administrator',
        email: 'admin@example.com',
        provider: 'email',
        role: 'ADMIN',
      };
      saveSession(adminSession);
      closeAuth();
      showToast('🛡️ Welcome Master Administrator! Dedicated Admin Console unlocked.', 'success');
      enterApp();
      const switchFn = (window as any).switchView;
      if (typeof switchFn === 'function') {
        switchFn('admin');
      }
      return;
    } else {
      const msg = 'Invalid administrator password. Access denied.';
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
      }
      showToast(msg, 'error');
      return;
    }
  }

  // Handle Password Reset Mode
  if (authMode === 'reset') {
    const submitBtn = document.getElementById('authSubmit');
    if (submitBtn) submitBtn.textContent = 'Sending...';

    try {
      await sendPasswordResetEmail(auth, email);
      const successMsg = `Password reset link sent to ${email}. Please check your inbox or spam folder.`;
      if (errorEl) {
        errorEl.style.color = '#34d399';
        errorEl.textContent = successMsg;
        errorEl.style.display = 'block';
      }
      showToast(`Password reset link sent to ${email}!`, 'success');
      if (submitBtn) submitBtn.textContent = 'Link Sent!';
      setTimeout(() => {
        setAuthMode('login');
      }, 3500);
    } catch (err: any) {
      console.error('Firebase Password Reset error:', err);
      const friendlyMsg = formatAuthError(err);
      if (errorEl) {
        errorEl.style.color = '#ef4444';
        errorEl.textContent = friendlyMsg;
        errorEl.style.display = 'block';
      }
      showToast(friendlyMsg, 'error');
      if (submitBtn) submitBtn.textContent = 'Send reset link';
    }
    return;
  }

  if (!password) {
    const msg = 'Please enter your password.';
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
    showToast(msg, 'error');
    return;
  }

  try {
    if (authMode === 'signup') {
      const confirmInput = document.getElementById('authConfirmPassword') as HTMLInputElement | null;
      const confirm = confirmInput?.value || '';
      if (password.length < 6) {
        const msg = 'Password must contain at least 6 characters.';
        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.style.display = 'block';
        }
        showToast(msg, 'error');
        return;
      }
      if (confirm && password !== confirm) {
        const msg = 'Passwords do not match.';
        if (errorEl) {
          errorEl.textContent = msg;
          errorEl.style.display = 'block';
        }
        showToast(msg, 'error');
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential?.user) {
        if (name) {
          await updateProfile(userCredential.user, { displayName: name }).catch(() => {});
        }
        await syncFirebaseUser(userCredential.user);
        closeAuth();
        showToast('Account created successfully!', 'success');
        enterApp();
      }
    } else {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential?.user) {
        await syncFirebaseUser(userCredential.user);
        closeAuth();
        showToast('Logged in successfully!', 'success');
        enterApp();
      }
    }
  } catch (err: any) {
    console.error('Firebase Auth error:', err);
    const friendlyMsg = formatAuthError(err);
    if (errorEl) {
      errorEl.textContent = friendlyMsg;
      errorEl.style.display = 'block';
    }
    showToast(friendlyMsg, 'error');
  }
}

export async function handleGoogleAuth(): Promise<void> {
  const button = document.getElementById('googleAuthButton');
  const icon = document.getElementById('googleButtonIcon');
  const label = document.getElementById('googleButtonLabel');
  const errorEl = document.getElementById('authErrorMessage');
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  if (!button || button.classList.contains('is-loading')) return;

  button.classList.add('is-loading');
  if (icon) {
    icon.dataset.defaultMarkup = icon.innerHTML;
    icon.innerHTML = '<span class="google-spinner" aria-hidden="true"></span>';
  }
  if (label) {
    label.dataset.defaultText = label.textContent || '';
    label.textContent = 'Connecting Google...';
  }

  try {
    let userCredential = null;
    try {
      userCredential = await signInWithPopup(auth, googleProvider);
    } catch (popupErr: any) {
      if (popupErr.code === 'auth/popup-blocked') {
        console.warn('Popup blocked, falling back to signInWithRedirect...');
        showToast('Redirecting to Google Sign-In...', 'info');
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      throw popupErr;
    }

    if (userCredential?.user) {
      await syncFirebaseUser(userCredential.user);
      closeAuth();
      showToast(`Welcome, ${userCredential.user.displayName || 'Google User'}!`, 'success');
      enterApp();
    }
  } catch (err: any) {
    console.error('Firebase Google OAuth error:', err);
    const friendlyMsg = formatAuthError(err);
    showToast(friendlyMsg, 'error');
    if (errorEl) {
      errorEl.textContent = friendlyMsg;
      errorEl.style.display = 'block';
    }
  } finally {
    resetGoogleAuthButton();
  }
}

export async function syncFirebaseUser(fbUser: any): Promise<UserSession> {
  const email = fbUser.email || 'user@example.com';
  const name =
    fbUser.displayName ||
    fbUser.providerData?.[0]?.displayName ||
    email.split('@')[0] ||
    'User';

  const provider = fbUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email';
  let role: 'USER' | 'ADMIN' = email.toLowerCase() === 'admin@example.com' ? 'ADMIN' : 'USER';
  let token: string | undefined = undefined;

  try {
    token = await fbUser.getIdToken?.();
  } catch {
    token = fbUser.accessToken;
  }

  // Sync or provision account in GraphQL backend if available
  try {
    const res = await graphQLRequest<{ googleAuth: { token: string; user: any } }>(
      MUTATIONS.GOOGLE_AUTH,
      { name, email }
    );
    if (res?.googleAuth) {
      token = res.googleAuth.token;
      role = res.googleAuth.user.role === 'ADMIN' ? 'ADMIN' : role;
    }
  } catch (err) {
    // Backend sync deferred
  }

  const userSession: UserSession = {
    name,
    email,
    provider,
    role,
    token,
  };

  saveSession(userSession);
  return userSession;
}

export function initFirebaseAuth(): boolean {
  try {
    // Capture result if user returns from a redirect-based sign-in
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await syncFirebaseUser(result.user);
          closeAuth();
          enterApp();
          showToast(`Welcome, ${result.user.displayName || 'Google User'}!`, 'success');
        }
      })
      .catch((err) => {
        console.warn('Firebase getRedirectResult error:', err);
      });

    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await syncFirebaseUser(fbUser);
        enterApp();
      }
    });
    return true;
  } catch (err) {
    console.error('Init Firebase auth error:', err);
    return false;
  }
}

export function handleGuestAuth(): void {
  saveSession({ name: 'Guest', email: 'guest@applytrack.local', provider: 'guest', role: 'USER' });
  closeAuth();
  showToast('You are browsing as Guest.', 'info');
  enterApp();
}

export function isAdmin(): boolean {
  return getSession()?.role === 'ADMIN';
}

export function enterApp(): void {
  const session = getSession();
  if (!session) {
    openAuth('login');
    return;
  }

  document.getElementById('landingPage')?.classList.add('app-shell-hidden');
  document.getElementById('appShell')?.classList.remove('app-shell-hidden');

  const userName = session.name || 'John Doe';
  const initials =
    userName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'JD';

  const topName = document.getElementById('topbarUserName');
  if (topName) topName.textContent = userName;

  const topEmail = document.getElementById('topbarUserEmail');
  if (topEmail) topEmail.textContent = session.email || '';

  document.getElementById('adminNavLink')?.classList.toggle('hidden', !isAdmin());
  document.getElementById('subscriptionBillingCard')?.classList.toggle('hidden', isAdmin());

  const sideName = document.getElementById('sidebarUserName');
  const sideInit = document.getElementById('sidebarUserInitials');
  if (sideName) sideName.textContent = userName;
  if (sideInit) sideInit.textContent = initials;

  document.title = 'ApplyTrack AI - Job Search Command Center';
}

export async function signOut(): Promise<void> {
  if (!getSession()) return;
  if (!confirm('Sign out of ApplyTrack AI?')) return;

  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('Firebase sign out error:', err);
  }

  localStorage.removeItem(AUTH_KEY);
  document.getElementById('profileDropdown')?.classList.remove('open');
  document.getElementById('appShell')?.classList.add('app-shell-hidden');
  document.getElementById('landingPage')?.classList.remove('app-shell-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showToast('You have been signed out.', 'info');
}

export function goHome(): void {
  document.getElementById('appShell')?.classList.add('app-shell-hidden');
  document.getElementById('landingPage')?.classList.remove('app-shell-hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function scrollToSection(id: string): void {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function focusPipelineStage(stageIndex: number): void {
  const frame = document.querySelector('.product-frame');
  const columns = frame?.querySelectorAll('.pipeline-board .pipe-col');
  const dots = frame?.querySelectorAll('.pipeline-stage-dot');
  const labels = ['Applied roles', 'Interview roles', 'Decision roles'];

  if (!frame || !columns || !dots || !columns[stageIndex]) return;

  columns.forEach((column, index) => column.classList.toggle('is-focused', index === stageIndex));
  dots.forEach((dot, index) => {
    const active = index === stageIndex;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-pressed', String(active));
  });

  const signal = frame.querySelector('.pipeline-footer .signal');
  if (signal) signal.textContent = `Focus: ${labels[stageIndex]}`;
}

export function toggleProfileMenu(): void {
  document.getElementById('profileDropdown')?.classList.toggle('open');
}

export function setTheme(theme: 'light' | 'dark'): void {
  const dark = theme === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.classList.toggle('dark-mode', dark);
  document.body.classList.toggle('dark', dark);
  document.body.classList.toggle('dark-mode', dark);
  localStorage.setItem('applytrack_ai_theme', theme);
  document.querySelectorAll('[data-theme-button="light"]').forEach((btn) => btn.classList.toggle('active', !dark));
  document.querySelectorAll('[data-theme-button="dark"]').forEach((btn) => btn.classList.toggle('active', dark));
}

export function loadTheme(): void {
  setTheme(localStorage.getItem('applytrack_ai_theme') === 'dark' ? 'dark' : 'light');
}
