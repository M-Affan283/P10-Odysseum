# Odysseum Maestro Tests

This directory contains UI tests for Odysseum using the Maestro testing framework.

## Prerequisites

1. Install the Maestro CLI:

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

2. Make sure your emulator is running or a physical device is connected.

## Running tests

You can run all tests or specific test files using the npm scripts defined in the project's package.json:

```bash
# Run all tests
npm run test:maestro

# Run specific tests
npm run test:welcome
npm run test:login
# etc.
```

## Test Structure

The tests are organized by screen functionality in the `flows` directory:

- `welcome_screen_test.yaml`: Tests for the welcome screen
- `login_screen_test.yaml`: Tests for the login flow
- `main_search_screen_test.yaml`: Tests for the main search screen
  And so on...

## Configuration

The `config.yaml` file contains global settings for the tests, including environment variables for test credentials.

## Adding new tests

To add new tests:

1. Create a new YAML file in the `flows` directory
2. Add the new test script to the `package.json` to make it easy to run
3. Follow the existing patterns for consistency

## Important notes

- These tests assume the app is already installed on the test device/emulator
- Some tests require specific test data to be present in the app
- The tests are designed to not make permanent changes (like creating/deleting data)

## Troubleshooting

- Make sure your application is properly built for the target platform before running tests
- If tests fail with permission issues, make sure all necessary permissions are granted to the app
- Check that your emulator or physical device has proper network connectivity
