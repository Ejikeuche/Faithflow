
// src/instrumentation.ts
import { config } from 'dotenv';
import admin from 'firebase-admin';

config({ path: '.env' });

export async function register() {
  // This function is executed once on the server when the application starts.
  // It's the ideal place to initialize the Firebase Admin SDK.
  
  const serviceAccountString = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (admin.apps.length) {
    return;
  }

  try {
    if (serviceAccountString) {
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
        console.log('Firebase Admin SDK Initialized with service account from environment variable.');
    } else {
        // In a Firebase/Google Cloud environment, initializeApp() with no arguments
        // will automatically use the service account associated with the environment.
        admin.initializeApp();
        console.log('Firebase Admin SDK Initialized using Application Default Credentials.');
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error:', error.stack);
  }
}
