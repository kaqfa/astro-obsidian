/**
 * Logger utility for conditional logging based on environment
 */

const isDevelopment = () => {
  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV === 'development';
  }
  return false;
};

export const logger = {
  /**
   * Debug logs - only shown in development
   */
  debug: (...args: any[]) => {
    if (isDevelopment()) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info logs - always shown
   */
  info: (...args: any[]) => {
    console.log('[INFO]', ...args);
  },

  /**
   * Warning logs - always shown
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logs - always shown
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },
};
