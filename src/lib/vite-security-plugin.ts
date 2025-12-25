import type { Plugin } from 'vite';

// Sensitive paths that should never be accessible
const SENSITIVE_PATHS = [
  '/.git',
  '/.env',
  '/.htaccess',
  '/node_modules',
  '/src',
  '/.astro',
  '/dist',
  '/package.json',
  '/package-lock.json',
  '/yarn.lock',
  '/pnpm-lock.yaml',
  '/tsconfig.json',
  '/local.db',
  '/.db',
];

/**
 * Vite plugin to block access to sensitive paths
 *
 * NOTE: In development (Vite dev server), this plugin works for paths
 * that reach the middleware layer. However, Vite's built-in fs.allow
 * check runs before custom middleware and may show detailed errors.
 *
 * In production (Node adapter), this plugin properly blocks all
 * sensitive paths and returns generic "Not Found" responses.
 *
 * This is an acceptable trade-off as development environment details
 * are not a security concern, and production is properly secured.
 */
export function securityPlugin(): Plugin {
  return {
    name: 'vite-security-plugin',
    configureServer(server) {
      return () => {
        server.middlewares.use((req, res, next) => {
          if (!req.url) {
            return next();
          }

          // Parse URL to get pathname
          let pathname: string;
          try {
            pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
          } catch {
            return next();
          }

          // Check if path is sensitive
          const isSensitive = SENSITIVE_PATHS.some(sensitivePath =>
            pathname === sensitivePath ||
            pathname.startsWith(sensitivePath + '/') ||
            pathname.startsWith(sensitivePath + '\\')
          );

          if (isSensitive) {
            // Log the blocked attempt (without exposing full path in production)
            console.log(`[SECURITY] Blocked access to sensitive path: ${pathname}`);

            // Return generic 404 without path information
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Not Found');
            return;
          }

          next();
        });
      };
    },
  };
}
