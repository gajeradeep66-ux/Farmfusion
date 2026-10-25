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

  // Fallback: in browser, if hosted on *.onrender.com and VITE_API_URL is missing,
  // automatically target the sibling backend web service on Render
  if (typeof window !== 'undefined' && window.location.hostname.endsWith('.onrender.com')) {
    return 'https://farmfusion-api.onrender.com/api';
  }

  return '/api';
};

const apiBaseUrl = getApiBaseUrl();

const api = axios.create({
  baseURL: apiBaseUrl,
});

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
