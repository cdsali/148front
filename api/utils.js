import { store, resetState } from '../src/store'; // Adjust path as needed

const base = import.meta.env.VITE_BASE_URL;

export const handleLogout = async () => {
  const token = localStorage.getItem('token');

  // ✅ 1. Call backend logout API
  try {
    if (token) {
      await fetch(`${base}/user/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (err) {
    console.error('Logout API error:', err);
    // Proceed anyway
  }

  // ✅ 2. Clear localStorage/sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // ✅ 3. Reset Redux state
  store.dispatch(resetState());

  // ✅ 4. Redirect to login
  window.location.href = '/login';
};
