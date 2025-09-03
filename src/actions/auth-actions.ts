
"use server";

interface AuthResult {
  success: boolean;
  error?: string;
  uid?: string;
}

// Sign up a new user by calling our secure API route
export async function signUpUser(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Use a relative URL for the API endpoint, as the client and server are on the same domain.
    const response = await fetch('/api/auth/signup', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      // If the server responded with an error status, use the error message from the response body
      return { success: false, error: result.error || "An unknown error occurred." };
    }

    return result;
  } catch (error: any) {
    console.error("Sign up action error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
