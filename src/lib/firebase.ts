
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "faithflow-t96q6",
  "appId": "1:530381876615:web:c88f51b1b746b2b8e23722",
  "storageBucket": "faithflow-t96q6.firebasestorage.app",
  "apiKey": "AIzaSyDWAhGS3hIxQP9sAAr6PqWiLFsKcFRrpQM",
  "authDomain": "faithflow-t96q6.firebaseapp.com",
  "messagingSenderId": "530381876615"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { app, db };
