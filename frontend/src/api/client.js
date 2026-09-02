import axios from 'axios';

// The backend origin comes entirely from VITE_API_URL - set per-environment
// in frontend/.env (local dev), frontend/.env.production (prod build), or
// the Vercel dashboard's Environment Variables for this project. Nothing is
// hardcoded here:
//   - Unset / empty -> relative "/api" paths (same-origin). Used for local
//     dev via Vite's proxy (vite.config.js) or a Docker/nginx setup where
//     nginx proxies /api to the backend container.
//   - Set to a full origin (e.g. the deployed backend's Vercel URL) -> that
//     origin is called directly. This is the required setup for this repo's
//     production deployment, since the frontend and backend are two
//     separate Vercel projects on two different domains.
const API_URL = import.meta.env.VITE_API_URL ?? '';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // sends the httpOnly auth cookie
});

// A tiny pub/sub so AuthContext can react to session expiry (401s) from
// anywhere in the app without every page having to handle it individually.
const unauthorizedListeners = new Set();
function onUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Skip for the auth endpoints themselves - a 401 from /auth/login or a
    // 401 from the initial /auth/me check is expected, not a session expiry.
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/me')) {
      unauthorizedListeners.forEach((listener) => listener());
    }
    return Promise.reject(error);
  }
);

// Best-effort human-readable message for any Axios/API error, so pages
// don't each have to know the shape of an error response.
function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.message === 'Network Error') return 'Could not reach the server. Check your connection and try again.';
  return fallback;
}

export default api;
export { API_URL, onUnauthorized, errorMessage };
