/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "js"],
  globalTeardown: "./tests/teardown.cjs",
  roots: ["<rootDir>"],
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^utils/(.*)$": "<rootDir>/src/utils/$1",
    "^modules/(.*)$": "<rootDir>/src/modules/$1",
    "^prisma/(.*)$": "<rootDir>/../prisma/$1",
    "^middlewares/(.*)$": "<rootDir>/src/middlewares/$1.js"
  }
};

