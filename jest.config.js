module.exports = {
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  testEnvironment: './puppeteer_environment.js',
  testMatch: [
    // '**/e2e/**/itemhold-verify-hold.spec.js'
    // '**/e2e/**/itemhold-release-item.spec.js'
    '**/__tests__/**/*.spec.js'
  ],
}
