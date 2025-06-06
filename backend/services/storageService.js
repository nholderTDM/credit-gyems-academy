// storageService.js - Clean Firebase Storage service for Credit Gyems Academy

const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin (with better error handling)
let isInitialized = false;

const initializeFirebase = () => {
  if (isInitialized || admin.apps.length > 0) {
    return admin.app();
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
    
    isInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
};

// Get Firebase Storage bucket
const getBucket = () => {
  initializeFirebase();
  return admin.storage().bucket();
};

// Test Firebase connection
const testConnection = async () => {
  try {
    const bucket = getBucket();
    
    // Try to list files to test connection
    await bucket.getFiles({ maxResults: 1 });
    
    console.log('✅ Firebase Storage connection successful');
    return true;
  } catch (error) {
    console.error('❌ Firebase Storage connection failed:', error.message);
    return false;
  }
};

// Upload test PDF function
const uploadTestPDF = async () => {
  try {
    // Create test PDF content
    const testPDFContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Resources<</Font<</F1 4 0 R>>>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj
5 0 obj<</Length 44>>stream
BT /F1 12 Tf 100 700 Td (Credit Gyems Test PDF) Tj ET
endstream endobj
xref 0 6
0000000000 65535 f 0000000010 00000 n 0000000053 00000 n 0000000102 00000 n 0000000214 00000 n 0000000281 00000 n 
trailer<</Size 6/Root 1 0 R>>startxref 375 %%EOF`;

    const buffer = Buffer.from(testPDFContent);
    
    // Generate unique filename
    const fileName = `test-products/credit-repair-guide-${uuidv4()}.pdf`;
    const bucket = getBucket();
    const file = bucket.file(fileName);
    
    // Upload the file
    await file.save(buffer, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          originalName: 'credit-repair-guide-test.pdf',
          uploadedBy: 'system',
          uploadedAt: new Date().toISOString()
        }
      }
    });
    
    // Make the file publicly accessible (for testing only)
    await file.makePublic();
    
    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log(`✅ Test PDF uploaded: ${fileName}`);
    
    return {
      fileName,
      publicUrl,
      fileSize: buffer.length,
      contentType: 'application/pdf',
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Error uploading test PDF:', error);
    throw error;
  }
};

// Generate signed download URL
const generateSignedDownloadUrl = async (fileName, expirationMinutes = 60) => {
  try {
    const bucket = getBucket();
    
    // Clean filename if it contains full URL
    if (fileName.startsWith('https://storage.googleapis.com/')) {
      fileName = fileName.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    }
    
    const file = bucket.file(fileName);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found: ${fileName}`);
    }
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);
    
    // Generate signed URL
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: expiresAt,
      version: 'v4'
    });
    
    console.log(`✅ Generated signed URL for: ${fileName} (expires: ${expiresAt.toLocaleString()})`);
    
    return {
      url: signedUrl,
      expiresAt,
      fileName
    };
  } catch (error) {
    console.error('❌ Error generating signed URL:', error);
    throw error;
  }
};

// Original uploadFile function (keeping for backward compatibility)
const uploadFile = async (file, folder = 'uploads') => {
  try {
    const bucket = getBucket();
    
    const filename = `${folder}/${uuidv4()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileUpload = bucket.file(filename);
    
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          uploadedAt: new Date().toISOString()
        }
      }
    });
    
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        console.error('Upload stream error:', error);
        reject(error);
      });
      
      stream.on('finish', async () => {
        try {
          // Make the file publicly accessible
          await fileUpload.makePublic();
          
          const url = `https://storage.googleapis.com/${bucket.name}/${filename}`;
          
          console.log(`✅ File uploaded successfully: ${filename}`);
          
          resolve({ 
            filename, 
            url,
            fileSize: file.size || 0,
            contentType: file.mimetype,
            uploadedAt: new Date()
          });
        } catch (error) {
          console.error('Error making file public:', error);
          reject(error);
        }
      });
      
      stream.end(file.buffer);
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Upload from buffer
const uploadFromBuffer = async (buffer, fileName, contentType = 'application/octet-stream', folder = 'uploads') => {
  try {
    const bucket = getBucket();
    
    const fullFileName = folder ? `${folder}/${fileName}` : fileName;
    const file = bucket.file(fullFileName);
    
    await file.save(buffer, {
      metadata: {
        contentType,
        metadata: {
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'system'
        }
      }
    });
    
    // Make file publicly accessible
    await file.makePublic();
    
    const url = `https://storage.googleapis.com/${bucket.name}/${fullFileName}`;
    
    console.log(`✅ Buffer uploaded as: ${fullFileName}`);
    
    return {
      fileName: fullFileName,
      url,
      fileSize: buffer.length,
      contentType,
      uploadedAt: new Date()
    };
  } catch (error) {
    console.error('❌ Error uploading from buffer:', error);
    throw error;
  }
};

// Get signed URL (original function, keeping for compatibility)
const getSignedUrl = async (filename, expirationMinutes = 60) => {
  try {
    const bucket = getBucket();
    
    // Clean filename if it contains full URL
    if (filename.startsWith('https://storage.googleapis.com/')) {
      filename = filename.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    }
    
    const options = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + expirationMinutes * 60 * 1000
    };
    
    const [url] = await bucket.file(filename).getSignedUrl(options);
    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

// Delete file from Firebase Storage
const deleteFile = async (filename) => {
  try {
    const bucket = getBucket();
    
    // Clean filename if it contains full URL
    if (filename.startsWith('https://storage.googleapis.com/')) {
      filename = filename.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    }
    
    const file = bucket.file(filename);
    
    // Check if file exists before trying to delete
    const [exists] = await file.exists();
    if (!exists) {
      console.warn(`⚠️  File not found for deletion: ${filename}`);
      return false;
    }
    
    await file.delete();
    console.log(`✅ File deleted: ${filename}`);
    return true;
  } catch (error) {
    console.error('❌ Error deleting file:', error);
    throw error;
  }
};

// Get file metadata
const getFileMetadata = async (filename) => {
  try {
    const bucket = getBucket();
    
    // Clean filename if it contains full URL
    if (filename.startsWith('https://storage.googleapis.com/')) {
      filename = filename.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    }
    
    const file = bucket.file(filename);
    const [metadata] = await file.getMetadata();
    
    return {
      name: metadata.name,
      size: parseInt(metadata.size),
      contentType: metadata.contentType,
      created: new Date(metadata.timeCreated),
      updated: new Date(metadata.updated),
      md5Hash: metadata.md5Hash
    };
  } catch (error) {
    console.error('❌ Error getting file metadata:', error);
    throw error;
  }
};

// List files in a directory
const listFiles = async (prefix = '', maxResults = 100) => {
  try {
    const bucket = getBucket();
    
    const [files] = await bucket.getFiles({
      prefix,
      maxResults
    });
    
    const fileList = files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      created: new Date(file.metadata.timeCreated),
      updated: new Date(file.metadata.updated)
    }));
    
    console.log(`✅ Listed ${fileList.length} files with prefix: ${prefix}`);
    
    return fileList;
  } catch (error) {
    console.error('❌ Error listing files:', error);
    throw error;
  }
};

// Get download stream
const getDownloadStream = async (filename) => {
  try {
    const bucket = getBucket();
    
    // Clean filename if it contains full URL
    if (filename.startsWith('https://storage.googleapis.com/')) {
      filename = filename.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
    }
    
    const file = bucket.file(filename);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found: ${filename}`);
    }
    
    return file.createReadStream();
  } catch (error) {
    console.error('❌ Error creating download stream:', error);
    throw error;
  }
};

// Export all functions
module.exports = {
  // Functions required by test script
  testConnection,
  uploadTestPDF,
  generateSignedDownloadUrl,
  
  // Original functions (for backward compatibility)
  uploadFile,
  getSignedUrl,
  deleteFile,
  
  // Additional utility functions
  uploadFromBuffer,
  getFileMetadata,
  listFiles,
  getDownloadStream,
  
  // Internal functions (if needed)
  initializeFirebase,
  getBucket
};