import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    // 🔐 1️⃣ Get token from header
    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 🔐 2️⃣ Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);

    // 🔐 3️⃣ Check if current user is superadmin
    const currentUser = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!currentUser || currentUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // 🛠 4️⃣ Get update data
    const { userId, status } = await req.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: "Missing userId or status" },
        { status: 400 }
      );
    }

    if (!["active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // 🛠 5️⃣ Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}