import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}'
    );

    if (Object.keys(serviceAccount).length > 0) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
       // In a Firebase/Google Cloud environment, initializeApp() with no arguments
      // will automatically use the service account associated with the environment.
      admin.initializeApp();
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
