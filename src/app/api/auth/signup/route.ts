import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token, name } = await req.json();

    if (!token || !name) {
      return NextResponse.json(
        { error: "Missing token or name" },
        { status: 400 }
      );
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);

    const { uid, email } = decodedToken;

    if (!email) {
      return NextResponse.json(
        { error: "Email not found in token" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid: uid });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 200 }
      );
    }

    // Create new designer (default role)
    const newUser = await User.create({
      firebaseUid: uid,
      name,
      email,
      role: "designer",
      status: "pending",
    });

    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed" },
      { status: 500 }
    );
  }
}
