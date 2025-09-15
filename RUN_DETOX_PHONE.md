# Running Detox Tests on Physical Android Device

## Important Note
Detox is primarily designed for emulators/simulators. Running on physical devices requires additional setup and may have limitations. For the best testing experience, use an Android emulator.

## Prerequisites for Physical Device Testing

### 1. Enable Developer Mode on Your Phone
1. Go to **Settings > About Phone**
2. Tap **Build Number** 7 times
3. Go back to **Settings > System > Developer Options**
4. Enable:
   - **Developer Options**
   - **USB Debugging**
   - **Install via USB**
   - **Disable permission monitoring** (if available)

### 2. Connect Your Phone
1. Connect your phone to PC via USB cable
2. Accept the "Allow USB Debugging" prompt on your phone
3. Verify connection:
   ```bash
   adb devices
   ```
   You should see your device listed

### 3. Install Android SDK Tools
If `adb` command is not found, you need to:

1. **Install Android Studio** or **Android SDK Command Line Tools**
2. Add to PATH:
   - Windows: Add `%LOCALAPPDATA%\Android\Sdk\platform-tools` to PATH
   - Or full path: `C:\Users\[YourUsername]\AppData\Local\Android\Sdk\platform-tools`

### 4. Build the App for Testing
```bash
cd react-native-frontend

# For Expo projects, you need to eject or use development builds
npx expo prebuild --platform android

# Build the debug APK
cd android
./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug
cd ..
```

### 5. Run Tests on Your Phone
```bash
# Make sure your phone is connected and detected
adb devices

# Run Detox tests on attached device
npm run test:e2e:android:phone
```

## Add Test Script to package.json
Add this script to your package.json if not already present:
```json
"test:e2e:android:phone": "detox test --configuration android.phone.debug"
```

## Alternative: Manual Testing Without Detox

Since your app is already running on your phone via Expo, you can:

1. **Manual E2E Testing**: Follow the test steps manually:
   - Open the app on your phone
   - Enter email: `user@test.com`
   - Enter password: `Password123!`
   - Tap login button
   - Verify welcome message appears

2. **Use Expo Development Build**: For automated testing, you need:
   ```bash
   npx expo install expo-dev-client
   npx eas build --profile development --platform android
   ```

## Troubleshooting

### ADB Not Recognized
```bash
# Windows - Add to System PATH:
C:\Users\[YourUsername]\AppData\Local\Android\Sdk\platform-tools

# Or use full path:
"C:\Users\[YourUsername]\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices
```

### Device Not Detected
1. Try different USB cable
2. Change USB connection mode to "File Transfer" or "MTP"
3. Reinstall phone drivers
4. Restart ADB:
   ```bash
   adb kill-server
   adb start-server
   ```

### Build Fails
For Expo projects, Detox requires ejecting or using development builds:
```bash
npx expo eject
# OR
npx expo prebuild
```

## Recommended Approach

For easier testing, use an Android emulator:

1. **Install Android Studio**
2. **Create an AVD (Android Virtual Device)**:
   - Open Android Studio
   - Tools > AVD Manager
   - Create Virtual Device
   - Choose device (e.g., Pixel 7)
   - Download system image
   - Create AVD

3. **Run tests on emulator**:
   ```bash
   # Start emulator
   emulator -avd YourEmulatorName

   # Build and test
   npm run test:e2e:build:android
   npm run test:e2e:android
   ```

## Current Test Coverage

The configured tests will:
1. Launch the app
2. Check login screen elements are visible
3. Enter credentials automatically
4. Tap login button
5. Verify successful navigation to home screen
6. Check welcome message is displayed

These tests ensure your authentication flow works correctly end-to-end.