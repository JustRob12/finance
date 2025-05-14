interface WindowWithEnv extends Window {
  env?: {
    VITE_API_URL: string;
    [key: string]: string;
  };
}

// Get environment variables from Vite or runtime env.js
export const getApiUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const windowWithEnv = window as WindowWithEnv;
  if (windowWithEnv.env?.VITE_API_URL) {
    return windowWithEnv.env.VITE_API_URL;
  }

  // Fallback to a default
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl(); 