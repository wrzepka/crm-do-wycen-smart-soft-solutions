// jest.setup.ts

// Matchers extension (for shadcn/ui testing)
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder
// For NextAuth and Zod
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

// 3. Mocking Next.js Navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));
