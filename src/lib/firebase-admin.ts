
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  admin.initializeApp({
    // Explicitly provide the projectId to ensure correct authentication
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

// Export the initialized services
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
