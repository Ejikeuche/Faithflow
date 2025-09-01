
import admin from 'firebase-admin';

// Initialize the Firebase Admin SDK.
// This will use Application Default Credentials (ADC) in the cloud environment.
if (!admin.apps.length) {
  admin.initializeApp();
}

export const auth = admin.auth();
export const db = admin.firestore();
