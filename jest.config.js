// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(j|t)s$': 'ts-jest'
  },
  testRegex: 'test/.*',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**'],
  coverageReporters: ['json', 'lcov', 'text', 'html'],
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1'
  }
};
