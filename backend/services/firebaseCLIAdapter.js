
// backend/services/firebaseCLIAdapter.js - Firebase CLI Authentication Adapter
const admin = require('firebase-admin');
const { execSync } = require('child_process');

let firebaseApp = null;
let bucket = null;

const initializeWithFirebaseCLI = async () => {
  if (firebaseApp) return bucket;

  try {
    console.log('🔥 Initializing Firebase with CLI authentication...');

    // Method 1: Use Firebase CLI authentication
    if (process.env.FIREBASE_AUTH_METHOD === 'cli') {
      console.log('🔐 Using Firebase CLI authentication...');
      
      // Get access token from Firebase CLI
      try {
        const tokenResult = execSync('firebase login:ci --quiet', { encoding: 'utf8' });
        console.log('✅ Firebase CLI token obtained');
      } catch (tokenError) {
        console.log('⚠️  Firebase CLI not authenticated. Run: firebase login');
      }

      // Initialize with default credentials (CLI provides these)
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }
    
    // Method 2: Use Firebase Emulator for development
    else if (process.env.USE_FIREBASE_EMULATOR === 'true') {
      console.log('🧪 Using Firebase Emulator...');
      
      process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
      process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';
      
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });
    }
    
    // Method 3: Fallback to Application Default Credentials
    else {
      console.log('🔧 Using Application Default Credentials...');
      firebaseApp = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
    }

    bucket = admin.storage().bucket();
    
    // Test connection
    try {
      await bucket.getMetadata();
      console.log('✅ Firebase Storage connected successfully');
    } catch (testError) {
      console.log('⚠️  Firebase Storage test failed - using mock mode');
      // Create mock bucket for development
      bucket = createMockBucket();
    }

    return bucket;

  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    
    // Return mock bucket for development
    console.log('🔧 Using mock Firebase for development...');
    return createMockBucket();
  }
};

// Mock bucket for development when Firebase isn't available
const createMockBucket = () => {
  return {
    file: (path) => ({
      exists: () => Promise.resolve([true]),
      getMetadata: () => Promise.resolve([{ size: 1024 }]),
      save: (data, options) => {
        console.log(`📝 Mock: Would save file ${path} (${data.length} bytes)`);
        return Promise.resolve();
      },
      download: (options) => {
        console.log(`📥 Mock: Would download file ${path}`);
        return Promise.resolve();
      },
      getSignedUrl: (options) => {
        const mockUrl = `https://mock-storage.googleapis.com/${path}?token=mock-token`;
        console.log(`🔗 Mock: Generated signed URL for ${path}`);
        return Promise.resolve([mockUrl]);
      },
      makePublic: () => {
        console.log(`🌐 Mock: Made file ${path} public`);
        return Promise.resolve();
      }
    }),
    getMetadata: () => {
      console.log('📊 Mock: Getting bucket metadata');
      return Promise.resolve([{ name: 'mock-bucket' }]);
    }
  };
};

module.exports = {
  initializeWithFirebaseCLI,
  createMockBucket
};
  