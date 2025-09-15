describe('Login Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show login screen', async () => {
    // Check if email input is visible
    await expect(element(by.id('email-input'))).toBeVisible();

    // Check if password input is visible
    await expect(element(by.id('password-input'))).toBeVisible();

    // Check if login button is visible
    await expect(element(by.id('login-button'))).toBeVisible();
  });

  it('should login successfully with valid credentials', async () => {
    // Enter email
    await element(by.id('email-input')).typeText('user@test.com');

    // Enter password
    await element(by.id('password-input')).typeText('Password123!');

    // Tap login button
    await element(by.id('login-button')).tap();

    // Wait for navigation and check if welcome message is visible
    await waitFor(element(by.id('welcome-message')))
      .toBeVisible()
      .withTimeout(5000);

    // Verify welcome message text
    await expect(element(by.id('welcome-message'))).toHaveText('Welcome to JIC Events!');
  });

  it('should show error with invalid credentials', async () => {
    // Enter invalid email
    await element(by.id('email-input')).typeText('invalid@test.com');

    // Enter invalid password
    await element(by.id('password-input')).typeText('WrongPassword');

    // Tap login button
    await element(by.id('login-button')).tap();

    // Wait for error alert
    await waitFor(element(by.text('Login Failed')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should clear inputs and login with different user', async () => {
    // Clear previous inputs
    await element(by.id('email-input')).clearText();
    await element(by.id('password-input')).clearText();

    // Enter new credentials
    await element(by.id('email-input')).typeText('testuser');
    await element(by.id('password-input')).typeText('Test123!');

    // Tap login button
    await element(by.id('login-button')).tap();

    // Wait for welcome message
    await waitFor(element(by.id('welcome-message')))
      .toBeVisible()
      .withTimeout(5000);
  });
});