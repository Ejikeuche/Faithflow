
"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { serverTimestamp } from "firebase/firestore";

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
    const userRecord = await adminAuth.createUser({
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
    } else if (error.code) {
        // This will catch codes like 'auth/insufficient-permission'
        errorMessage = `An error occurred during sign-up: ${error.message} (code: ${error.code})`;
    }
    else {
        errorMessage = error.message;
    }
    console.error("Sign up error:", error);
    return { success: false, error: errorMessage };
  }
}
