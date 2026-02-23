import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { Furniture } from "@/models/Furniture";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await adminAuth.verifyIdToken(token);

    // You already have /api/me logic
    // Here we trust superadmin only can access this route

    const body = await req.json();

    const {
      name,
      category,
      widthInches,
      depthInches,
      heightFeet,
      modelUrl,
      thumbnailUrl,
    } = body;

    const newFurniture = await Furniture.create({
      name,
      category,
      widthInches,
      depthInches,
      heightFeet,
      modelUrl,
      thumbnailUrl,
    });

    return NextResponse.json(newFurniture, { status: 201 });
  } catch (error) {
    console.error("Furniture create error:", error);
    return NextResponse.json(
      { error: "Failed to create furniture" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await adminAuth.verifyIdToken(token);

    const furniture = await Furniture.find().sort({ createdAt: -1 });

    return NextResponse.json(furniture);
  } catch (error) {
    console.error("Fetch furniture error:", error);
    return NextResponse.json(
      { error: "Failed to fetch furniture" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await adminAuth.verifyIdToken(token);

    const { id } = await req.json();

    await Furniture.findByIdAndDelete(id);

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete furniture" },
      { status: 500 }
    );
  }
}
