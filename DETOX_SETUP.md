# Detox E2E Testing Setup Guide

## Overview
This project is configured with Detox for end-to-end testing of the React Native app. Detox tests can run on both Android and iOS platforms.

## Prerequisites

### General Requirements
- Node.js v20.17.0 or higher
- React Native development environment set up
- Detox CLI: `npm install -g detox-cli`

### Android Requirements
- Android Studio with SDK installed
- Android Emulator or physical device
- Java JDK 11 or higher
- Set ANDROID_HOME environment variable

### iOS Requirements (macOS only)
- Xcode 14+ installed
- iOS Simulator
- CocoaPods: `sudo gem install cocoapods`

## Installation
All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## Test Components with TestIDs

The following components have been configured with testIDs for testing:

1. **Login Screen** (`src/screens/LoginScreen.js`):
   - `email-input`: Email input field
   - `password-input`: Password input field
   - `login-button`: Login submit button

2. **Home Screen** (`src/screens/HomeScreen.js`):
   - `welcome-message`: Welcome message shown after successful login

## Running Tests

### Android

#### 1. Start Android Emulator
First, ensure you have an Android emulator running:

```bash
# List available emulators
emulator -list-avds

# Start an emulator (replace with your AVD name)
emulator -avd Pixel_7_Pro_API_34
```

Or start the emulator from Android Studio.

#### 2. Build the App for Testing
```bash
npm run test:e2e:build:android
```

#### 3. Run the Tests
```bash
npm run test:e2e:android
```

### iOS (macOS only)

#### 1. Install iOS Dependencies
```bash
cd ios && pod install && cd ..
```

#### 2. Build the App for Testing
```bash
npm run test:e2e:build:ios
```

#### 3. Run the Tests
```bash
npm run test:e2e:ios
```

## Test Credentials

Use these credentials for testing the login flow:

- **Email:** user@test.com
- **Password:** Password123!

Alternative test user:
- **Username:** testuser
- **Password:** Test123!

## Available Test Scripts

```json
"test:e2e:build:android": "detox build --configuration android.emu.debug",
"test:e2e:android": "detox test --configuration android.emu.debug",
"test:e2e:build:ios": "detox build --configuration ios.sim.debug",
"test:e2e:ios": "detox test --configuration ios.sim.debug",
"test:e2e:android:release": "detox test --configuration android.emu.release",
"test:e2e:ios:release": "detox test --configuration ios.sim.release"
```

## Test Structure

Tests are located in the `e2e/` directory:

- `e2e/login.test.js`: Login flow tests
  - Verifies login screen components are visible
  - Tests successful login with valid credentials
  - Tests error handling with invalid credentials
  - Tests clearing inputs and logging in with different user

## Troubleshooting

### Android Issues

1. **Build fails**: Ensure ANDROID_HOME is set correctly:
   ```bash
   echo $ANDROID_HOME
   ```

2. **Emulator not found**: Update the AVD name in `.detoxrc.js`:
   ```javascript
   device: {
     avdName: 'YOUR_EMULATOR_NAME'
   }
   ```

3. **App crashes**: Make sure Metro bundler is running:
   ```bash
   npm start
   ```

### iOS Issues

1. **Build fails**: Clean and rebuild:
   ```bash
   cd ios && xcodebuild clean && cd ..
   npm run test:e2e:build:ios
   ```

2. **Simulator not found**: Update device type in `.detoxrc.js`:
   ```javascript
   device: {
     type: 'iPhone 15' // Change to your available simulator
   }
   ```

## Configuration Files

- `.detoxrc.js`: Main Detox configuration
- `e2e/jest.config.js`: Jest configuration for Detox tests
- `package.json`: Test scripts and dependencies

## Adding New Tests

1. Add testIDs to your React Native components:
   ```jsx
   <TextInput testID="my-input" />
   <TouchableOpacity testID="my-button">
   ```

2. Create a new test file in `e2e/` directory:
   ```javascript
   describe('My Feature', () => {
     it('should do something', async () => {
       await element(by.id('my-input')).typeText('test');
       await element(by.id('my-button')).tap();
       // Add assertions
     });
   });
   ```

## Best Practices

1. Always add meaningful testIDs to interactive components
2. Use `waitFor` for elements that may take time to appear
3. Clear app state between tests when necessary
4. Keep tests focused and independent
5. Use descriptive test names

## Gradle Configuration (Android)

For Android, Detox requires some Gradle configuration. If not already configured, add to `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        testBuildType System.getProperty('testBuildType', 'debug')
        testInstrumentationRunner 'androidx.test.runner.AndroidJUnitRunner'
    }
}

dependencies {
    androidTestImplementation('com.wix:detox:+')
    implementation 'androidx.appcompat:appcompat:1.1.0'
}
```

## Additional Resources

- [Detox Documentation](https://wix.github.io/Detox/)
- [Writing Detox Tests](https://wix.github.io/Detox/docs/api/matchers)
- [Detox CLI Commands](https://wix.github.io/Detox/docs/cli/overview)