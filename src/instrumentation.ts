
// src/instrumentation.ts
import admin from 'firebase-admin';

export async function register() {
  // This function is executed once on the server when the application starts.
  // It's the ideal place to initialize the Firebase Admin SDK.
  
  if (admin.apps.length) {
    return;
  }

  try {
     // In a Firebase/Google Cloud environment, initializeApp() with no arguments
     // will automatically use the service account associated with the environment.
     admin.initializeApp();
     console.log('Firebase Admin SDK Initialized using Application Default Credentials.');
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}
