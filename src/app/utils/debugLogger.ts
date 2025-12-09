/**
 * Debug logger to trace white screen issues
 * Enable by setting localStorage.setItem('debug', 'true')
 */

const isDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('debug') === 'true' || import.meta.env.DEV;
};

export const debugLog = (category: string, message: string, data?: any) => {
  if (!isDebugEnabled()) return;
  
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${category}] ${message}`;
  
  // Also log to a global array for inspection
  if (typeof window !== 'undefined') {
    (window as any).__debugLogs = (window as any).__debugLogs || [];
    (window as any).__debugLogs.push({
      timestamp,
      category,
      message,
      data: data ? JSON.parse(JSON.stringify(data)) : undefined
    });
  }
};

export const debugError = (category: string, message: string, error?: any) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${category}] ERROR: ${message}`;
  
  console.error(logMessage, error || '');
  
  if (typeof window !== 'undefined') {
    (window as any).__debugErrors = (window as any).__debugErrors || [];
    (window as any).__debugErrors.push({
      timestamp,
      category,
      message,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...(error.response && {
          status: error.response.status,
          data: typeof error.response.data === 'string' 
            ? error.response.data.substring(0, 500)
            : error.response.data
        })
      } : undefined
    });
  }
};

