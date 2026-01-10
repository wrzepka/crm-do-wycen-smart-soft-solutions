// Matchers extension (for shadcn/ui testing)
import '@testing-library/jest-dom';

// Polyfill for TextEncoder/TextDecoder
// For NextAuth and Zod
import { TextEncoder, TextDecoder } from 'util';

Object.assign(global, { TextEncoder, TextDecoder });

// URL of DB for tests
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error('DATABASE_URL is not defined');
}

// If DB name does not contain 'test' and database server is not located locally, STOP THE TESTS
if (!dbUrl.includes('test') || !dbUrl.includes('localhost')) {
  const errorMessage = `FATAL ERROR: BLOKADA BEZPIECZEŃSTWA
  
  Próbujesz uruchomić testy na bazie produkcyjnej/deweloperskiej!
  Wykryty URL: ${dbUrl}
  
  Wymagane jest słowo 'test' w nazwie bazy danych (np. nextcrm_test).
  Wymagana jest również baza hostowana lokalnie '@localhost'.
  Zmień URL w pliku '.env.test' i spróbuj ponownie.
  `;

  throw new Error(errorMessage);
}

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
