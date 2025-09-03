// src/instrumentation.ts
import { adminDb } from '@/lib/firebase-admin';

export async function register() {
  console.log('Firebase Admin SDK Initialized');
  // The adminDb import will ensure the SDK is initialized.
  // You can add any other boot-up logic here if needed.
}
