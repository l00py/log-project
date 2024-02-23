module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ['<rootDir>/tests/envSetup.ts'],
  // setupFilesAfterEnv: ['<rootDir>/tests/envSetup.ts']
};
