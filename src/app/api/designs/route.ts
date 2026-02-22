import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Design } from "@/models/Design";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { title, roomWidthFeet, roomHeightFeet, furniture } = body;

    const design = await Design.create({
      userId: user._id,
      title,
      roomWidthFeet,
      roomHeightFeet,
      furniture,
    });

    return NextResponse.json(design, { status: 201 });

  } catch (error) {
    console.error("Save design error:", error);
    return NextResponse.json(
      { error: "Failed to save design" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const designs = await Design.find({ userId: user._id })
      .sort({ createdAt: -1 });

    return NextResponse.json(designs);

  } catch (error) {
    console.error("Fetch designs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch designs" },
      { status: 500 }
    );
  }
}