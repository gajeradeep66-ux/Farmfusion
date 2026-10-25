import axios from 'axios';

const getApiBaseUrl = () => {
  let raw = import.meta.env.VITE_API_URL?.trim();

  // If raw is Render internal service host like 'farmfusion-api' (no dots, not localhost)
  if (raw && !raw.includes('.') && !raw.startsWith('http') && !raw.includes('localhost') && !raw.includes('127.0.0.1')) {
    raw = `https://${raw}.onrender.com`;
  }

  if (raw) {
    const hasProtocol = raw.startsWith('http://') || raw.startsWith('https://');
    const normalized = hasProtocol ? raw : `https://${raw}`;
    const clean = normalized.replace(/\/+$/, '');
    return /\/api$/i.test(clean) ? clean : `${clean}/api`;
  }

  // If running in browser on farmfusion-api.onrender.com or localhost, use same-origin relative /api
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'farmfusion-api.onrender.com' || host === 'localhost' || host === '127.0.0.1') {
      return '/api';
    }
    // If hosted on a custom or separate frontend on Render, target backend
    if (host.endsWith('.onrender.com')) {
      return 'https://farmfusion-api.onrender.com/api';
    }
  }

  return '/api';
};

const apiBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15000, // 15-second timeout prevents indefinite hanging
});

// In-browser keep-alive ping: keeps backend warm every 4.5 minutes while user has page open
if (typeof window !== 'undefined') {
  setInterval(() => {
    if (document.visibilityState === 'visible') {
      api.get('/health').catch(() => {});
    }
  }, 4.5 * 60 * 1000);
}

export const resolveImageUrl = (image) => {
  if (!image) return '';
  if (!image.startsWith('/uploads/')) return image;

  try {
    const apiOrigin = apiBaseUrl.startsWith('http')
      ? new URL(apiBaseUrl).origin
      : window.location.origin;
    return new URL(image, apiOrigin).toString();
  } catch {
    return image;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmfusion_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
