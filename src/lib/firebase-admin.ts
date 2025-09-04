import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // In a Firebase/Google Cloud environment, initializeApp() with no arguments
    // will automatically use the service account associated with the environment.
    admin.initializeApp();
    console.log('Firebase Admin SDK Initialized.');
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
