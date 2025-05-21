const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    console.log('Firebase Admin SDK initialized');
  } catch (error) {
    // App might already be initialized
    console.log('Firebase admin initialization error (might be already initialized):', error.message);
  }
};

module.exports = { initializeFirebaseAdmin };