// Simple Gmail-only auth using localStorage
// User must sign in with Google to access the app

export interface UserProfile {
  name: string;
  email: string;
  picture: string;
  initial: string;
  loggedInAt: string;
}

const AUTH_KEY = 'clarity360_user';

export function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(AUTH_KEY);
    if (!data) return null;
    const user = JSON.parse(data);
    // Session expires after 30 days
    const MAX_SESSION_MS = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(user.loggedInAt).getTime() > MAX_SESSION_MS) {
      logout();
      return null;
    }
    return user;
  } catch { return null; }
}

export function setUser(user: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {
  return getUser() !== null;
}
