const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    }),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
} catch (error) {
  // App might already be initialized
  console.log('Firebase admin initialization error (might be already initialized):', error.message);
}

const bucket = admin.storage().bucket();

// Upload file to Firebase Storage
exports.uploadFile = async (file, folder = 'uploads') => {
  try {
    const filename = `${folder}/${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileUpload = bucket.file(filename);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });
    
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(error);
      });
      
      stream.on('finish', async () => {
        // Make the file publicly accessible
        await fileUpload.makePublic();
        
        const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        resolve({ filename, url });
      });
      
      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Get a signed URL for temporary file access
exports.getSignedUrl = async (filename, expirationMinutes = 60) => {
  try {
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationMinutes * 60 * 1000
    };
    
    // If the filename starts with https://, extract just the path
    if (filename.startsWith('https://storage.googleapis.com/')) {
      filename = filename.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    }
    
    const [url] = await bucket.file(filename).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Delete file from Firebase Storage
exports.deleteFile = async (filename) => {
  try {
    // If the filename starts with https://, extract just the path
    if (filename.startsWith('https://storage.googleapis.com/')) {
      filename = filename.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    }
    
    await bucket.file(filename).delete();
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};