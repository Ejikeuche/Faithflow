
import admin from 'firebase-admin';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    admin.initializeApp({
        projectId,
        // In a managed environment, service account is discovered automatically.
        // Specifying projectId ensures it connects to the correct project.
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
