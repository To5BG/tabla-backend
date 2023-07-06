// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/node_modules/'],
  transform: {
    '^.+\\.(j|t)s$': 'ts-jest'
  },
  testRegex: 'test/.*',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**'],
  coverageReporters: ['json', 'lcov', 'text', 'html']
};
