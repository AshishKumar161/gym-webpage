/**
 * Centralized API Configuration
 * 
 * Determines API Base URL dynamically using environment variables or current window location.
 * Prevents hardcoded localhost URLs across multiple frontend files.
 */

const getApiBaseUrl = () => {
  // Check for custom Vite environment variable
  if (import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Fallback in local browser environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname || 'localhost';
    return `http://${hostname}:5000/api/v1`;
  }

  return 'http://localhost:5000/api/v1';
};

export const API_BASE = getApiBaseUrl();
export default API_BASE;
