const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testMatch: ['**/__tests__/**/*.test.{js,jsx,ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/**/*.stories.tsx',
    '!app/**/__tests__/**',
  ],
  testPathIgnorePatterns: [
    './tests/'
  ],
  /*   
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  }
  */
}

module.exports = createJestConfig(customJestConfig)