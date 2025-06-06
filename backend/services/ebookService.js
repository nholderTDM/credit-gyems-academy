const { initializeWithFirebaseCLI } = require('./firebaseCLIAdapter');
// services/ebookService.js - Complete E-Book Service with Alternative Authentication
const admin = require('firebase-admin');
const PDFDocument = require('pdfkit');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const os = require('os');

// Initialize Firebase Admin SDK with multiple authentication strategies
let firebaseInitialized = false;
let bucket = null;


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
};

/**
 * Get or create temp directory for PDF processing
 * @returns {Promise<string>} Temp directory path
 */
const getTempDirectory = async () => {
  const tempDir = process.env.TEMP_DIR || path.join(os.tmpdir(), 'credit-gyems-ebooks');
  
  try {
    await fs.access(tempDir);
  } catch {
    await fs.mkdir(tempDir, { recursive: true });
  }
  
  return tempDir;
};

/**
 * Create watermarked PDF for specific user with enhanced security
 * @param {string} originalFilePath - Path to original PDF in Firebase Storage
 * @param {Object} userInfo - User information for watermarking
 * @param {Object} orderInfo - Order information
 * @returns {Promise<Object>} Watermarked file information
 */
const createWatermarkedPDF = async (originalFilePath, userInfo, orderInfo) => {
  try {
    console.log(`🎨 Creating watermarked PDF for user: ${userInfo.userName}`);
    
    // Initialize Firebase if needed
    const storageBucket = await initializeFirebase();
    
    const { userId, userName, userEmail } = userInfo;
    const { orderId, orderNumber, purchaseDate } = orderInfo;
    
    // Download original PDF from Firebase Storage
    const originalFile = storageBucket.file(originalFilePath);
    const [originalExists] = await originalFile.exists();
    
    if (!originalExists) {
      throw new Error(`Original e-book file not found: ${originalFilePath}`);
    }
    
    // Create temp directory and file paths
    const tempDir = await getTempDirectory();
    const tempOriginalPath = path.join(tempDir, `original-${uuidv4()}.pdf`);
    const tempWatermarkedPath = path.join(tempDir, `watermarked-${uuidv4()}.pdf`);
    
    console.log(`📥 Downloading original file to: ${tempOriginalPath}`);
    
    // Download original file
    await originalFile.download({ destination: tempOriginalPath });
    
    // Create comprehensive watermark text with security elements
    const securityFingerprint = crypto.createHash('sha256')
      .update(`${userId}:${orderId}:${process.env.WATERMARK_SECRET || 'default-secret'}`)
      .digest('hex').substring(0, 12);
    
    const watermarkData = {
      primary: `Licensed to: ${userName} | ${userEmail}`,
      secondary: `Order: ${orderNumber} | Date: ${new Date(purchaseDate).toLocaleDateString()}`,
      security: `ID: ${userId.slice(-8)} | Security: ${securityFingerprint}`,
      copyright: `© Credit Gyems Academy | Personal Use Only`,
      timestamp: new Date().toISOString()
    };
    
    // Process PDF with pdf-lib for better compatibility
    const PDFLib = require('pdf-lib');
    const { rgb } = PDFLib;
    
    // Read original PDF
    const originalPdfBytes = await fs.readFile(tempOriginalPath);
    const pdfDoc = await PDFLib.PDFDocument.load(originalPdfBytes);
    
    // Get all pages
    const pages = pdfDoc.getPages();
    console.log(`📄 Processing ${pages.length} pages`);
    
    // Add watermark to each page
    pages.forEach((page, pageIndex) => {
      const { width, height } = page.getSize();
      
      // Multiple watermark positions for security
      const positions = [
        { x: 50, y: height - 30, text: watermarkData.primary, size: 8, opacity: 0.3 },
        { x: width - 300, y: height - 30, text: watermarkData.secondary, size: 7, opacity: 0.3 },
        { x: 50, y: 30, text: watermarkData.security, size: 7, opacity: 0.25 },
        { x: width - 250, y: 30, text: watermarkData.copyright, size: 7, opacity: 0.25 },
        { x: width / 2 - 100, y: height / 2, text: watermarkData.primary, size: 12, opacity: 0.1, rotate: 45 }
      ];
      
      // Add subtle background watermark on every 3rd page
      if ((pageIndex + 1) % 3 === 0) {
        positions.push({
          x: width / 2 - 150,
          y: height / 2 - 50,
          text: `LICENSED TO ${userName.toUpperCase()}`,
          size: 24,
          opacity: 0.05,
          rotate: 45
        });
      }
      
      positions.forEach(pos => {
        try {
          if (pos.rotate) {
            page.drawText(pos.text, {
              x: pos.x,
              y: pos.y,
              size: pos.size,
              color: rgb(0.5, 0.5, 0.5),
              opacity: pos.opacity,
              rotate: PDFLib.degrees(pos.rotate)
            });
          } else {
            page.drawText(pos.text, {
              x: pos.x,
              y: pos.y,
              size: pos.size,
              color: rgb(0.5, 0.5, 0.5),
              opacity: pos.opacity
            });
          }
        } catch (textError) {
          console.warn(`⚠️ Could not add watermark to page ${pageIndex + 1}:`, textError.message);
        }
      });
    });
    
    // Add comprehensive metadata for tracking
    pdfDoc.setTitle(`Credit Gyems Academy - Licensed to ${userName}`);
    pdfDoc.setAuthor('Credit Gyems Academy');
    pdfDoc.setSubject(`Order: ${orderNumber} | Licensed Copy`);
    pdfDoc.setKeywords([
      `UserID:${userId}`,
      `OrderID:${orderId}`,
      `Security:${securityFingerprint}`,
      `Licensed:${new Date().toISOString()}`,
      `Email:${crypto.createHash('md5').update(userEmail).digest('hex').substring(0, 8)}`
    ]);
    pdfDoc.setCreator('Credit Gyems Academy E-Book System');
    pdfDoc.setProducer('Credit Gyems Academy Secure Delivery');
    
    // Save watermarked PDF
    const watermarkedPdfBytes = await pdfDoc.save();
    await fs.writeFile(tempWatermarkedPath, watermarkedPdfBytes);
    
    console.log(`💾 Watermarked PDF created: ${tempWatermarkedPath}`);
    
    // Upload watermarked PDF to Firebase Storage
    const watermarkedFileName = `${userId}-${orderId}-${uuidv4()}.pdf`;
    const watermarkedFilePath = `user-downloads/${userId}/${watermarkedFileName}`;
    const watermarkedFile = storageBucket.file(watermarkedFilePath);
    
    console.log(`☁️ Uploading to Firebase: ${watermarkedFilePath}`);
    
    await watermarkedFile.save(watermarkedPdfBytes, {
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          userId,
          orderId,
          orderNumber,
          originalFileName: originalFilePath,
          watermarked: 'true',
          securityFingerprint,
          createdAt: new Date().toISOString(),
          userEmail: crypto.createHash('md5').update(userEmail).digest('hex').substring(0, 8) // Hashed for privacy
        }
      }
    });
    
    // Clean up temporary files
    try {
      await fs.unlink(tempOriginalPath);
      await fs.unlink(tempWatermarkedPath);
      console.log('🧹 Temporary files cleaned up');
    } catch (cleanupError) {
      console.warn('⚠️ Could not clean up temporary files:', cleanupError.message);
    }
    
    console.log('✅ Watermarked PDF created and uploaded successfully');
    
    return {
      watermarkedFilePath,
      watermarkedFileName,
      fileSize: watermarkedPdfBytes.length,
      securityFingerprint,
      watermarkInfo: {
        userName,
        userEmail,
        orderNumber,
        userId: userId.slice(-8),
        createdAt: new Date().toISOString()
      }
    };
    
  } catch (error) {
    console.error('❌ Error creating watermarked PDF:', error);
    throw new Error(`Failed to create watermarked e-book: ${error.message}`);
  }
};

/**
 * Generate secure download token with enhanced anti-piracy measures
 * @param {string} userId - User ID
 * @param {string} productId - Product ID  
 * @param {string} orderId - Order ID
 * @param {Object} additionalData - Additional security data
 * @returns {string} Secure download token
 */
const generateSecureDownloadToken = (userId, productId, orderId, additionalData = {}) => {
  const timestamp = Date.now();
  const tokenData = {
    userId,
    productId,
    orderId,
    timestamp,
    // Enhanced security fingerprint
    fingerprint: crypto.createHash('sha256')
      .update(`${userId}:${productId}:${orderId}:${timestamp}:${process.env.WATERMARK_SECRET || 'default-secret'}`)
      .digest('hex').substring(0, 16),
    // Browser/device fingerprint if available
    deviceFingerprint: additionalData.deviceFingerprint || null,
    // Expiration (24 hours from creation)
    expiresAt: timestamp + (24 * 60 * 60 * 1000),
    ...additionalData
  };
  
  const tokenString = JSON.stringify(tokenData);
  const hmac = crypto.createHmac('sha256', process.env.DOWNLOAD_TOKEN_SECRET || 'default-download-secret');
  hmac.update(tokenString);
  const signature = hmac.digest('hex');
  
  return Buffer.from(`${tokenString}.${signature}`).toString('base64url');
};

/**
 * Verify download token with comprehensive security checks
 * @param {string} token - Download token to verify
 * @param {Object} requestInfo - Request information for additional verification
 * @returns {Object|null} Token data or null if invalid
 */
const verifyDownloadToken = (token, requestInfo = {}) => {
  try {
    const decoded = Buffer.from(token, 'base64url').toString();
    const [tokenString, signature] = decoded.split('.');
    
    if (!tokenString || !signature) {
      console.warn('🚫 Invalid token format');
      return null;
    }
    
    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.DOWNLOAD_TOKEN_SECRET || 'default-download-secret');
    hmac.update(tokenString);
    const expectedSignature = hmac.digest('hex');
    
    if (signature !== expectedSignature) {
      console.warn('🚫 Invalid download token signature');
      return null;
    }
    
    const tokenData = JSON.parse(tokenString);
    
    // Check expiration
    if (Date.now() > tokenData.expiresAt) {
      console.warn('🚫 Download token expired');
      return null;
    }
    
    // Verify fingerprint for additional security
    const expectedFingerprint = crypto.createHash('sha256')
      .update(`${tokenData.userId}:${tokenData.productId}:${tokenData.orderId}:${tokenData.timestamp}:${process.env.WATERMARK_SECRET || 'default-secret'}`)
      .digest('hex').substring(0, 16);
    
    if (tokenData.fingerprint !== expectedFingerprint) {
      console.warn('🚫 Invalid download token fingerprint');
      return null;
    }
    
    // Additional device fingerprint check if available
    if (tokenData.deviceFingerprint && requestInfo.deviceFingerprint) {
      if (tokenData.deviceFingerprint !== requestInfo.deviceFingerprint) {
        console.warn('🚫 Device fingerprint mismatch');
        return null;
      }
    }
    
    return tokenData;
  } catch (error) {
    console.error('❌ Error verifying download token:', error);
    return null;
  }
};

/**
 * Create secure download for user with watermarking and anti-piracy
 * @param {string} userId - User ID
 * @param {string} productId - Product ID
 * @param {string} orderId - Order ID
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Download information
 */
const createSecureEbookDownload = async (userId, productId, orderId, options = {}) => {
  try {
    console.log(`🚀 Creating secure e-book download for user: ${userId}`);
    
    const User = require('../models/user');
    const Product = require('../models/product');
    const Order = require('../models/order');
    const EbookDownload = require('../models/ebookDownload');
    
    // Get user, product, and order information
    const [user, product, order] = await Promise.all([
      User.findById(userId),
      Product.findById(productId),
      Order.findById(orderId)
    ]);
    
    if (!user) throw new Error('User not found');
    if (!product) throw new Error('Product not found');
    if (!order) throw new Error('Order not found');
    
    if (product.type !== 'ebook') {
      throw new Error('Product is not an e-book');
    }
    
    if (!product.filePath) {
      throw new Error('E-book file not found - please upload the PDF file first');
    }
    
    console.log(`📚 Processing e-book: ${product.title}`);
    
    // Check if watermarked version already exists and is still valid
    let existingDownload = await EbookDownload.findOne({
      userId,
      productId,
      orderId,
      isActive: true
    });
    
    if (existingDownload && existingDownload.watermarkedFilePath) {
      // Verify the watermarked file still exists in Firebase
      try {
        const storageBucket = await initializeFirebase();
        const watermarkedFile = storageBucket.file(existingDownload.watermarkedFilePath);
        const [exists] = await watermarkedFile.exists();
        
        if (exists) {
          console.log('♻️ Using existing watermarked file');
          
          // Generate new download token
          const downloadToken = generateSecureDownloadToken(userId, productId, orderId, {
            downloadId: existingDownload._id.toString(),
            deviceFingerprint: options.deviceFingerprint
          });
          
          // Update download record
          existingDownload.lastAccessedAt = new Date();
          existingDownload.downloadCount += 1;
          existingDownload.downloadTokens.push({
            token: downloadToken,
            createdAt: new Date(),
            isActive: true
          });
          
          await existingDownload.save();
          
          return {
            downloadId: existingDownload._id,
            downloadToken,
            productTitle: product.title,
            watermarked: true,
            downloadCount: existingDownload.downloadCount,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
          };
        } else {
          console.log('🔄 Existing watermarked file not found, creating new one');
        }
      } catch (checkError) {
        console.warn('⚠️ Could not verify existing watermarked file:', checkError.message);
      }
    }
    
    // Create new watermarked PDF
    console.log('🎨 Creating new watermarked PDF...');
    const watermarkResult = await createWatermarkedPDF(
      product.filePath,
      {
        userId,
        userName: `${user.firstName} ${user.lastName}`,
        userEmail: user.email
      },
      {
        orderId,
        orderNumber: order.orderNumber,
        purchaseDate: order.createdAt
      }
    );
    
    // Generate download token
    const downloadToken = generateSecureDownloadToken(userId, productId, orderId, {
      deviceFingerprint: options.deviceFingerprint
    });
    
    // Create or update download record
    if (existingDownload) {
      // Update existing record
      existingDownload.watermarkedFilePath = watermarkResult.watermarkedFilePath;
      existingDownload.watermarkedFileName = watermarkResult.watermarkedFileName;
      existingDownload.fileSize = watermarkResult.fileSize;
      existingDownload.watermarkInfo = watermarkResult.watermarkInfo;
      existingDownload.securityFingerprint = watermarkResult.securityFingerprint;
      existingDownload.downloadCount += 1;
      existingDownload.lastAccessedAt = new Date();
      existingDownload.downloadTokens.push({
        token: downloadToken,
        createdAt: new Date(),
        isActive: true
      });
      
      await existingDownload.save();
      console.log('✅ Updated existing download record');
    } else {
      // Create new download record
      existingDownload = new EbookDownload({
        userId,
        productId,
        orderId,
        originalFilePath: product.filePath,
        watermarkedFilePath: watermarkResult.watermarkedFilePath,
        watermarkedFileName: watermarkResult.watermarkedFileName,
        fileSize: watermarkResult.fileSize,
        watermarkInfo: watermarkResult.watermarkInfo,
        securityFingerprint: watermarkResult.securityFingerprint,
        downloadCount: 1,
        downloadTokens: [{
          token: downloadToken,
          createdAt: new Date(),
          isActive: true
        }],
        createdAt: new Date(),
        lastAccessedAt: new Date(),
        isActive: true,
        antiPiracy: {
          suspiciousActivity: [],
          isBlocked: false
        },
        metadata: {
          deviceInfo: [],
          totalBandwidthUsed: 0
        }
      });
      
      await existingDownload.save();
      console.log('✅ Created new download record');
    }
    
    return {
      downloadId: existingDownload._id,
      downloadToken,
      productTitle: product.title,
      watermarked: true,
      downloadCount: existingDownload.downloadCount,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
    
  } catch (error) {
    console.error('❌ Error creating secure e-book download:', error);
    throw error;
  }
};

/**
 * Process e-book download with comprehensive security checks
 * @param {string} downloadToken - Secure download token
 * @param {Object} requestInfo - Request information for security
 * @returns {Promise<Object>} Download information
 */
const processEbookDownload = async (downloadToken, requestInfo = {}) => {
  try {
    console.log('🔐 Processing e-book download request...');
    
    // Verify token
    const tokenData = verifyDownloadToken(downloadToken, requestInfo);
    if (!tokenData) {
      throw new Error('Invalid or expired download token');
    }
    
    const EbookDownload = require('../models/ebookDownload');
    const Product = require('../models/product');
    
    // Get download record
    const download = await EbookDownload.findOne({
      userId: tokenData.userId,
      productId: tokenData.productId,
      orderId: tokenData.orderId,
      isActive: true
    }).populate('productId', 'title');
    
    if (!download) {
      throw new Error('Download record not found');
    }
    
    if (download.antiPiracy.isBlocked) {
      throw new Error('Download has been blocked due to suspicious activity');
    }
    
    // Initialize Firebase
    const storageBucket = await initializeFirebase();
    
    // Verify watermarked file exists
    const watermarkedFile = storageBucket.file(download.watermarkedFilePath);
    const [exists] = await watermarkedFile.exists();
    
    if (!exists) {
      throw new Error('Watermarked file not found - please contact support');
    }
    
    // Generate signed URL for download (5 minutes expiry for security)
    const [signedUrl] = await watermarkedFile.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 5 * 60 * 1000 // 5 minutes
    });
    
    // Record download attempt with enhanced tracking
    const downloadRecord = {
      timestamp: new Date(),
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      downloadToken: downloadToken.substring(0, 20) + '...', // Partial token for logs
      deviceFingerprint: requestInfo.deviceFingerprint,
      success: true
    };
    
    download.downloadHistory.push(downloadRecord);
    download.downloadCount += 1;
    download.lastAccessedAt = new Date();
    
    // Update device tracking
    if (requestInfo.userAgent && requestInfo.ipAddress) {
      let deviceInfo = download.metadata.deviceInfo.find(device => 
        device.userAgent === requestInfo.userAgent && 
        device.ipAddress === requestInfo.ipAddress
      );
      
      if (deviceInfo) {
        deviceInfo.lastSeen = new Date();
        deviceInfo.downloadCount += 1;
      } else {
        download.metadata.deviceInfo.push({
          userAgent: requestInfo.userAgent,
          ipAddress: requestInfo.ipAddress,
          firstSeen: new Date(),
          lastSeen: new Date(),
          downloadCount: 1
        });
      }
    }
    
    // Update bandwidth usage
    download.metadata.totalBandwidthUsed += download.fileSize;
    
    // Detect suspicious activity
    const suspiciousActivities = download.detectSuspiciousActivity();
    if (suspiciousActivities.length > 0) {
      console.warn(`🚨 Suspicious activity detected for download ${download._id}:`, suspiciousActivities);
    }
    
    await download.save();
    
    // Update product download statistics
    await Product.findByIdAndUpdate(tokenData.productId, {
      $inc: { downloads: 1 }
    });
    
    console.log('✅ Download processed successfully');
    
    return {
      downloadUrl: signedUrl,
      fileName: download.watermarkedFileName,
      fileSize: download.fileSize,
      productTitle: download.productId.title,
      downloadCount: download.downloadCount,
      watermarkInfo: download.watermarkInfo
    };
    
  } catch (error) {
    console.error('❌ Error processing e-book download:', error);
    throw error;
  }
};

/**
 * Get comprehensive download analytics
 * @param {Object} filters - Filter options
 * @returns {Promise<Object>} Download analytics
 */
const getEbookAnalytics = async (filters = {}) => {
  try {
    const EbookDownload = require('../models/ebookDownload');
    
    const matchStage = { isActive: true };
    
    if (filters.startDate && filters.endDate) {
      matchStage.createdAt = {
        $gte: new Date(filters.startDate),
        $lte: new Date(filters.endDate)
      };
    }
    
    if (filters.productId) {
      matchStage.productId = filters.productId;
    }
    
    // Overall statistics
    const overallStats = await EbookDownload.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: '$downloadCount' },
          uniqueUsers: { $addToSet: '$userId' },
          uniqueProducts: { $addToSet: '$productId' },
          avgDownloadsPerUser: { $avg: '$downloadCount' },
          totalWatermarkedFiles: { $sum: 1 },
          totalBandwidth: { $sum: '$metadata.totalBandwidthUsed' }
        }
      },
      {
        $project: {
          totalDownloads: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          uniqueProducts: { $size: '$uniqueProducts' },
          avgDownloadsPerUser: { $round: ['$avgDownloadsPerUser', 2] },
          totalWatermarkedFiles: 1,
          totalBandwidth: 1
        }
      }
    ]);
    
    // Product-wise statistics
    const productStats = await EbookDownload.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$productId',
          totalDownloads: { $sum: '$downloadCount' },
          uniqueUsers: { $addToSet: '$userId' },
          lastDownload: { $max: '$lastAccessedAt' },
          totalBandwidth: { $sum: '$metadata.totalBandwidthUsed' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          productTitle: '$product.title',
          totalDownloads: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          lastDownload: 1,
          totalBandwidth: 1
        }
      },
      { $sort: { totalDownloads: -1 } }
    ]);
    
    // Security statistics
    const securityStats = await EbookDownload.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          blockedDownloads: {
            $sum: {
              $cond: ['$antiPiracy.isBlocked', 1, 0]
            }
          },
          suspiciousActivity: {
            $sum: {
              $size: { $ifNull: ['$antiPiracy.suspiciousActivity', []] }
            }
          },
          multipleDeviceUsers: {
            $sum: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$metadata.deviceInfo', []] } }, 3] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);
    
    // Recent download activity
    const recentActivity = await EbookDownload.find(matchStage)
      .populate('userId', 'firstName lastName email')
      .populate('productId', 'title')
      .sort({ lastAccessedAt: -1 })
      .limit(20)
      .select('userId productId downloadCount lastAccessedAt watermarkInfo antiPiracy.suspiciousActivity');
    
    return {
      overall: overallStats[0] || {
        totalDownloads: 0,
        uniqueUsers: 0,
        uniqueProducts: 0,
        avgDownloadsPerUser: 0,
        totalWatermarkedFiles: 0,
        totalBandwidth: 0
      },
      byProduct: productStats,
      security: securityStats[0] || {
        blockedDownloads: 0,
        suspiciousActivity: 0,
        multipleDeviceUsers: 0
      },
      recentActivity: recentActivity.map(activity => ({
        userName: `${activity.userId.firstName} ${activity.userId.lastName}`,
        userEmail: activity.userId.email,
        productTitle: activity.productId.title,
        downloadCount: activity.downloadCount,
        lastAccessed: activity.lastAccessedAt,
        watermarkInfo: activity.watermarkInfo,
        hasSuspiciousActivity: activity.antiPiracy.suspiciousActivity.length > 0
      }))
    };
    
  } catch (error) {
    console.error('❌ Error getting e-book analytics:', error);
    throw error;
  }
};

/**
 * Upload e-book file to Firebase Storage (Admin function)
 * @param {Object} file - Multer file object
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Upload result
 */
const uploadEbookFile = async (file, productId) => {
  try {
    console.log(`📤 Uploading e-book file for product: ${productId}`);
    
    // Initialize Firebase
    const storageBucket = await initializeFirebase();
    
    // Validate file
    if (!file || file.mimetype !== 'application/pdf') {
      throw new Error('Only PDF files are allowed for e-books');
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File size must be less than 100MB');
    }
    
    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${productId}-${uuidv4()}${fileExtension}`;
    const filePath = `ebooks/${productId}/${uniqueFilename}`;
    
    // Create file reference
    const fileRef = storageBucket.file(filePath);
    
    // Upload file
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          originalName: file.originalname,
          productId: productId,
          uploadedAt: new Date().toISOString(),
          fileSize: file.size.toString()
        }
      }
    });
    
    console.log(`✅ E-book uploaded successfully: ${filePath}`);
    
    return {
      success: true,
      filePath,
      fileName: uniqueFilename,
      originalName: file.originalname,
      size: file.size,
      contentType: file.mimetype
    };
    
  } catch (error) {
    console.error('❌ Error uploading e-book file:', error);
    throw error;
  }
};

// Authentication setup instructions
const getAuthInstructions = () => {
  return `
🔐 Firebase Authentication Setup Instructions:

Since service account key creation is blocked by organization policies, use Application Default Credentials:

1. Install Google Cloud CLI:
   https://cloud.google.com/sdk/docs/install

2. Authenticate with your Google account:
   gcloud auth application-default login

3. Set your project:
   gcloud config set project credit-gyems-academy

4. Test the connection:
   node -e "console.log('Testing...'); require('./services/ebookService').initializeFirebase().then(() => console.log('✅ Success')).catch(e => console.error('❌ Error:', e.message))"

5. Environment variables needed:
   FIREBASE_PROJECT_ID=credit-gyems-academy
   FIREBASE_STORAGE_BUCKET=credit-gyems-academy.appspot.com
   DOWNLOAD_TOKEN_SECRET=your-secure-random-string
   WATERMARK_SECRET=your-watermark-secret
`;
};

module.exports = {
  initializeFirebase,
  createWatermarkedPDF,
  generateSecureDownloadToken,
  verifyDownloadToken,
  createSecureEbookDownload,
  processEbookDownload,
  getEbookAnalytics,
  uploadEbookFile,
  getAuthInstructions
};