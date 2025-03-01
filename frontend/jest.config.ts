import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',  // Transform TypeScript files using ts-jest
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',  // Mock CSS modules using identity-obj-proxy
    '^@/(.*)$': '<rootDir>/src/$1',  // Resolve '@' alias to the 'src' directory
  },
  moduleDirectories: ['node_modules', 'src'],  // Ensure Jest can find files in the 'src' folder
  testEnvironment: 'jsdom',
};

export default config;
