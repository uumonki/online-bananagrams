/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^utils$': '<rootDir>/src/utils',
    '^config$': '<rootDir>/src/config',
    '^types/(.*)$': '<rootDir>/src/types/$1',
    '^game/(.*)$': '<rootDir>/src/game/$1',
    '^rooms/(.*)$': '<rootDir>/src/rooms/$1',
    '^ws/(.*)$': '<rootDir>/src/ws/$1',
  },
};