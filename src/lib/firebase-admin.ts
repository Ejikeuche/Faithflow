
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export the initialized services
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
