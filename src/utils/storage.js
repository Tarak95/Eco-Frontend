// Safe helpers for the saved user. A corrupted value in localStorage (for example the text "undefined")
// used to crash the whole React app and leave a blank white page.

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (err) {
    console.warn('Removed corrupted "user" from localStorage:', err.message);
    try {
      localStorage.removeItem('user');
    } catch {
      /* ignore */
    }
    return null;
  }
};

export const setStoredUser = (user) => {
  try {
    if (user && typeof user === 'object') localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  } catch {
    /* storage can be blocked (private mode) - the app still works for this session */
  }
};

// ---- login session (ONE token key: "token") ----
export const getToken = () => {
  try {
    return localStorage.getItem('token') || '';
  } catch {
    return '';
  }
};

export const setSession = (token, user) => {
  try {
    if (token) localStorage.setItem('token', token);
    if (user && typeof user === 'object') localStorage.setItem('user', JSON.stringify(user));
  } catch {
    /* storage blocked */
  }
};

export const clearSession = () => {
  try {
    ['token', 'user', 'ecobazar_token', 'ecobazar_user'].forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
};
