
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // In a Firebase/Google Cloud environment (like App Hosting), 
    // initializeApp() with no arguments automatically uses the 
    // service account associated with the environment.
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
