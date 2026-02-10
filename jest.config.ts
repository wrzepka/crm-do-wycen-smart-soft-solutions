import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/src/__tests__/utils.ts'],

  // Add ignored paths
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/__tests__/utils.ts',
    '<rootDir>/src/generated/',
    '<rootDir>/src/lib/prisma-client.ts',
  ],

  // Map prisma client
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',

    '^@prisma/client/runtime/client$': '<rootDir>/node_modules/@prisma/client/runtime/client.js',
    '^@prisma/client/runtime/(.*)\\.mjs$': '<rootDir>/node_modules/@prisma/client/runtime/$1.js',
  },

  // Ignore all node_modules files except prisma adapter
  transformIgnorePatterns: ['/node_modules/(?!@prisma|@auth/prisma-adapter)/'],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
