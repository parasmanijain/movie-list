import axios from 'axios';

// Create a shared axios instance with base configuration
const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_API_URL as string,
  headers: {
    'Content-Type': 'application/json'
  },
  // Set a sensible timeout to prevent hanging requests
  timeout: 30000
});

// Response interceptor: surface errors consistently
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not log cancelled requests as errors
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }
    const status = error.response?.status;
    const message = error.response?.data?.error || error.message || 'Unknown error';
    console.error(`[Axios] ${status ?? 'Network'} error: ${message}`);
    return Promise.reject(error);
  }
);

export default instance;
