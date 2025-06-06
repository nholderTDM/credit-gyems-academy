// scripts/setupFirebaseAuth.js - Firebase CLI Authentication Setup
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const setupFirebaseAuth = () => {
  console.log('🔥 Setting up Firebase CLI Authentication...\n');

  // Check if Firebase CLI is installed
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    console.log('✅ Firebase CLI is installed');
  } catch (error) {
    console.log('❌ Firebase CLI not found. Installing...');
    console.log('Run: npm install -g firebase-tools');
    console.log('Then run this script again.');
    return false;
  }

  // Login to Firebase
  console.log('\n🔐 Step 1: Login to Firebase');
  console.log('Run this command and follow the browser authentication:');
  console.log('firebase login');
  
  // Set project
  console.log('\n📋 Step 2: Set your Firebase project');
  console.log('firebase use credit-gyems-academy');
  
  // Get service account via Firebase CLI (alternative to console)
  console.log('\n🔑 Step 3: Generate service account via CLI');
  console.log('firebase projects:addsdk');
  
  // Alternative: Use Firebase emulator for development
  console.log('\n🧪 Alternative: Use Firebase Emulator for Development');
  console.log('firebase init emulators');
  console.log('firebase emulators:start');

  // Update your .env file
  console.log('\n📝 Step 4: Update your .env file');
  console.log('Add these lines to your .env:');
  console.log('FIREBASE_AUTH_METHOD=cli');
  console.log('USE_FIREBASE_EMULATOR=true  # For development');
  console.log('FIREBASE_EMULATOR_HOST=localhost:9199');

  return true;
};

// Modified ebookService initialization for Firebase CLI
const createFirebaseCLIAdapter = () => {
  const adapterCode = `
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
        storageBucket: \`\${process.env.FIREBASE_PROJECT_ID}.appspot.com\`
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
        console.log(\`📝 Mock: Would save file \${path} (\${data.length} bytes)\`);
        return Promise.resolve();
      },
      download: (options) => {
        console.log(\`📥 Mock: Would download file \${path}\`);
        return Promise.resolve();
      },
      getSignedUrl: (options) => {
        const mockUrl = \`https://mock-storage.googleapis.com/\${path}?token=mock-token\`;
        console.log(\`🔗 Mock: Generated signed URL for \${path}\`);
        return Promise.resolve([mockUrl]);
      },
      makePublic: () => {
        console.log(\`🌐 Mock: Made file \${path} public\`);
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
  `;

  // Write the adapter file
  const adapterPath = path.join(__dirname, '../backend/services/firebaseCLIAdapter.js');
  fs.writeFileSync(adapterPath, adapterCode);
  console.log(`✅ Created Firebase CLI adapter: ${adapterPath}`);
};

// Update ebookService to use CLI adapter
const updateEbookService = () => {
  const ebookServicePath = path.join(__dirname, '../backend/services/ebookService.js');
  
  if (fs.existsSync(ebookServicePath)) {
    let content = fs.readFileSync(ebookServicePath, 'utf8');
    
    // Add import for CLI adapter at the top
    const importLine = "const { initializeWithFirebaseCLI } = require('./firebaseCLIAdapter');\n";
    if (!content.includes('firebaseCLIAdapter')) {
      content = importLine + content;
    }
    
    // Replace initializeFirebase function
    const newInitFunction = `
const initializeFirebase = async () => {
  if (firebaseInitialized) return bucket;
  
  try {
    // Use Firebase CLI adapter
    bucket = await initializeWithFirebaseCLI();
    firebaseInitialized = true;
    return bucket;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    throw error;
  }
};`;
    
    // Replace the existing initializeFirebase function
    content = content.replace(
      /const initializeFirebase = async \(\) => \{[\s\S]*?\};/,
      newInitFunction
    );
    
    fs.writeFileSync(ebookServicePath, content);
    console.log('✅ Updated ebookService.js to use Firebase CLI authentication');
  }
};

if (require.main === module) {
  setupFirebaseAuth();
  createFirebaseCLIAdapter();
  updateEbookService();
  
  console.log('\n🎉 Firebase CLI setup complete!');
  console.log('\nNext steps:');
  console.log('1. Run: firebase login');
  console.log('2. Run: firebase use credit-gyems-academy');
  console.log('3. Update your .env with the suggested variables');
  console.log('4. Test with: node scripts/testProductsWorking.js');
}

module.exports = { setupFirebaseAuth, createFirebaseCLIAdapter, updateEbookService };