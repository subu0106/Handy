const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  // For production (Vercel) - decode base64 encoded service account
  try {
    const serviceAccountKey = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64').toString('utf8');
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (error) {
    console.error('Error parsing Firebase service account key:', error);
    process.exit(1);
  }
} else {
  // For local development - use the JSON file
  try {
    serviceAccount = require('../serviceAccountKey.json');
  } catch (error) {
    console.error('Firebase service account key not found. Please set FIREBASE_SERVICE_ACCOUNT_KEY environment variable for production.');
    process.exit(1);
  }
}

// Initialize Firebase Admin only if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;