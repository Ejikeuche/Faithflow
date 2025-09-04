
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // In a managed environment like App Hosting, initializeApp() without
    // arguments will automatically use the service account credentials.
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
    // In a local development environment, you might need to provide credentials explicitly.
    // For this project, we assume it's running in a managed environment.
  }
}

// Export the initialized services
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
