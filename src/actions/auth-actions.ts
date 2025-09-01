
"use server";

import { auth, db as adminDb } from "@/lib/firebase-admin";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Note: For this demo, we're not creating corresponding user documents in Firestore.
// In a real application, you would typically create a user document in a 'users'
// collection in Firestore upon successful sign-up to store additional user profile
// information and roles.

interface AuthResult {
  success: boolean;
  error?: string;
  uid?: string;
}

// Sign up a new user
export async function signUpUser(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const userRecord = await auth.createUser({
      email,
      password,
    });
    
    // After creating the user, create a corresponding document in the 'members' collection
    const memberData = {
        name: email.split('@')[0], // Default name from email
        email: email,
        role: "Member",
        joined: new Date().toISOString().split('T')[0],
        phone: "",
        address: "",
        createdAt: serverTimestamp()
    };
    
    // Note: We are using the UID from the auth user as the document ID
    await adminDb.collection("members").doc(userRecord.uid).set(memberData);

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    let errorMessage = "An unknown error occurred.";
    if (error.code === 'auth/email-already-exists') {
        errorMessage = "An account with this email address already exists.";
    } else if (error.code === 'auth/weak-password') {
        errorMessage = "The password is too weak. It must be at least 6 characters long.";
    } else {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}
