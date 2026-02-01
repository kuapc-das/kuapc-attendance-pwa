// Configuration for API endpoints
// Uses environment variables if available, otherwise falls back to defaults

const getEnv = (key: string, fallback: string): string => {
  // Support for Vite (import.meta.env)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  // Support for Create React App / Webpack (process.env)
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      // @ts-ignore
      return process.env[key];
    }
  } catch (e) {
    // Ignore error
  }

  return fallback;
};

export const API_CONFIG = {
  // Google Apps Script Deployment URL
  APPS_SCRIPT_URL: getEnv(
    'VITE_APPS_SCRIPT_URL', 
    getEnv('REACT_APP_APPS_SCRIPT_URL', "https://script.google.com/macros/s/AKfycbzexvWhRR0OmYm218G7vW6_5JlKt9oM0LcDjoGPN6CnfWeMjVP6CUSeTQtIXxw3G0slfQ/exec")
  ),
  
  // Cloudflare Worker Proxy URL
  PROXY_URL: getEnv(
    'VITE_PROXY_URL', 
    getEnv('REACT_APP_PROXY_URL', "https://attendance-cors.kuapc-das.workers.dev")
  )
};