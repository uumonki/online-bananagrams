/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^utils$': '<rootDir>/utils',
    '^config$': '<rootDir>/config',
    '^types/(.*)$': '<rootDir>/types/$1',
    '^game/(.*)$': '<rootDir>/game/$1',
    '^rooms/(.*)$': '<rootDir>/rooms/$1',
    '^ws/(.*)$': '<rootDir>/ws/$1',
  },
};