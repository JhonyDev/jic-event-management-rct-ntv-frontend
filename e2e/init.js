// Detox initialization file
// This file is needed to set up Detox properly

beforeAll(async () => {
  await device.launchApp({
    newInstance: true,
  });
});

beforeEach(async () => {
  // Optional: Reset app state between tests
});