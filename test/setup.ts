// Import testing library after mocks
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { vi, afterEach } from 'vitest';

// Mock environment before importing anything else
globalThis.process = {
  env: {
    NODE_ENV: 'test',
    TURSO_DATABASE_URL: 'file:test.db',
  },
} as any;

// Mock Astro globals
globalThis.Astro = {
  url: new URL('http://localhost:4321'),
  request: new Request('http://localhost:4321'),
  cookies: {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
  },
  redirect: vi.fn(),
} as any;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
