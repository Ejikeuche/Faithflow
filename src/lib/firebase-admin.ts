
import admin from 'firebase-admin';

const initializeAdminApp = () => {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
    return {
        auth: admin.auth(),
        db: admin.firestore(),
    };
};

// Export a getter function for db and auth
// This allows for lazy initialization
export const getAdminAuth = () => initializeAdminApp().auth;
export const getAdminDb = () => initializeAdminApp().db;
