// backend/services/firebaseAuth.js - Firebase authentication helper
const admin = require('firebase-admin');

let firebaseApp = null;

/**
 * Initialize Firebase Admin SDK with multiple strategies
 */
const initializeFirebaseAdmin = async () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    console.log('🔥 Initializing Firebase Admin...');

    // Strategy 1: Service Account Key (recommended for production)
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      console.log('📝 Using service account credentials...');
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    // Strategy 2: Service Account File (if you have the JSON file)
    else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log('📄 Using service account file...');
      
      firebaseApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    // Strategy 3: Firebase Emulator (for testing)
    else if (process.env.NODE_ENV === 'development' && process.env.FIREBASE_EMULATOR) {
      console.log('🧪 Using Firebase Emulator...');
      
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    // Strategy 4: Minimal initialization for testing (won't work for storage)
    else {
      console.log('⚠️  Using minimal Firebase initialization (storage operations will fail)');
      
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    // Test the connection
    const bucket = admin.storage().bucket();
    try {
      await bucket.getMetadata();
      console.log('✅ Firebase Storage connection successful');
    } catch (error) {
      console.warn('⚠️  Firebase Storage test failed:', error.message);
      console.warn('   This might be due to authentication issues');
    }

    return firebaseApp;
    
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
};

/**
 * Get Firebase Storage bucket
 */
const getStorageBucket = async () => {
  if (!firebaseApp) {
    await initializeFirebaseAdmin();
  }
  
  return admin.storage().bucket();
};

/**
 * Download service account key instructions
 */
const getServiceAccountInstructions = () => {
  return `
🔑 Firebase Service Account Setup (Alternative to gcloud):

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project: credit-gyems-academy
3. Click the gear icon (Settings) → Project settings
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file
7. Either:
   Option A: Set the file path in your .env:
   GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   
   Option B: Extract the values and add to .env:
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@credit-gyems-academy.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYour private key here\\n-----END PRIVATE KEY-----\\n"

8. Restart your application

🔧 For testing without authentication:
   Set NODE_ENV=development and FIREBASE_EMULATOR=true in your .env
`;
};

module.exports = {
  initializeFirebaseAdmin,
  getStorageBucket,
  getServiceAccountInstructions
};