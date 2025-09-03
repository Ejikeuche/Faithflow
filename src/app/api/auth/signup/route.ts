
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
    });

    // When a user signs up, create a corresponding document in the 'members' collection
    const memberData = {
      name: email.split("@")[0], // Default name from email
      email: email,
      role: "Member",
      joined: new Date().toISOString().split("T")[0],
      phone: "",
      address: "",
      createdAt: FieldValue.serverTimestamp(),
    };
    
    // Use the user's UID from Auth as the document ID in Firestore
    await adminDb.collection("members").doc(userRecord.uid).set(memberData);

    return NextResponse.json({ success: true, uid: userRecord.uid });

  } catch (error: any) {
    let errorMessage = "An unknown error occurred during sign-up.";
    if (error.code === "auth/email-already-exists") {
      errorMessage = "An account with this email address already exists.";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "The password is too weak. It must be at least 6 characters long.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    console.error("Sign up API error:", error);
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
