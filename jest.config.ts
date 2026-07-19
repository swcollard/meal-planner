import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Allow relative TS imports written with a `.js` extension under NodeNext.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
  // baerly ships ESM-only; let it through the transform pipeline so jest's
  // ESM resolver picks up its `import` export condition.
  transformIgnorePatterns: ['node_modules/(?!@gusto/baerly-storage)'],
  testMatch: ['**/*.test.ts'],
};

export default config;
