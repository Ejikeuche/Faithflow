
import admin from 'firebase-admin';

// This is the recommended pattern for initializing the Firebase Admin SDK in a Next.js app.
// It ensures that the SDK is initialized only once.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
