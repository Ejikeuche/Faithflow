
// src/instrumentation.ts
import { config } from 'dotenv';
import admin from 'firebase-admin';

config({ path: '.env' });

export async function register() {
  // This function is executed once on the server when the application starts.
  // It's the ideal place to initialize the Firebase Admin SDK.
  
  const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccount && !admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
      console.log('Firebase Admin SDK Initialized with service account.');
    } catch (error: any) {
      console.error('Firebase admin initialization error with service account:', error.stack);
    }
  } else if (!admin.apps.length) {
     try {
      // In a Firebase/Google Cloud environment, initializeApp() with no arguments
      // will automatically use the service account associated with the environment.
      admin.initializeApp();
      console.log('Firebase Admin SDK Initialized using Application Default Credentials.');
    } catch (error: any) {
      console.error('Firebase admin initialization error with ADC:', error.stack);
    }
  }
}
