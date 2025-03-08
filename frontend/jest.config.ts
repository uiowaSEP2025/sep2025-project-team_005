module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest', // Handle TypeScript
    '^.+\\.css$': 'jest-transform-css', // CSS handling
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.module\\.css$': 'identity-obj-proxy', // Mock CSS modules with identity-obj-proxy
  },
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.jest.json', // Ensures use of correct JSX setting for Jest, as defined in tsconfig.jest.json
    },
  },
};
