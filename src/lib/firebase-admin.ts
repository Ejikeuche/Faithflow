
import admin from 'firebase-admin';

// The admin app is initialized in instrumentation.ts.
// This file is just for exporting the admin services.

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
