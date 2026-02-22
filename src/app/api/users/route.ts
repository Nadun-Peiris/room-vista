import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const currentUser = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!currentUser || currentUser.role !== "superadmin") {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const users = await User.find({ role: "designer" }).sort({
      createdAt: -1,
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}