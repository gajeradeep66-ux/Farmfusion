import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiBaseUrl = configuredApiUrl
  ? `${configuredApiUrl.startsWith('http') ? '' : 'https://'}${configuredApiUrl.replace(/\/+$/, '')}${/\/api$/i.test(configuredApiUrl) ? '' : '/api'}`
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
});

export const resolveImageUrl = (image) => {
  if (!image?.startsWith('/uploads/')) return image;
  const apiOrigin = apiBaseUrl.startsWith('http') ? apiBaseUrl : window.location.origin;
  return new URL(image, apiOrigin).toString();
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmfusion_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
