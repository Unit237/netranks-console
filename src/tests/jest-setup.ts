import '@testing-library/jest-dom';

// Mock import.meta.env (Vite-specific) for Jest
// This global will be used by the transformer
(globalThis as any).__importMetaEnv__ = {
  DEV: false,
  PROD: true,
  VITE_PROD: 'false',
  VITE_BACKEND_API_URL: 'http://localhost:4000',
  VITE_DEMO_BACKEND_API_URL: 'http://localhost:4000',
  VITE_NETRANKS_DOMAIN: 'https://www.netranks.ai',
  VITE_USE_MOCK_USER_DATA: 'false',
};

// Mock uuid to avoid ES module transformation issues
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-' + Math.random().toString(36).substring(7)),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;
