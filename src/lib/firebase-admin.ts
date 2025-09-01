
import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

// Export the initialized services
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
