import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Design } from "@/models/Design";

const DEFAULT_ROOM_SHAPE = "rectangle";
const DEFAULT_WALL_COLOR = "#e2e8f0";
const DEFAULT_FLOOR_COLOR = "#f3f4f6";
const DEFAULT_LIGHT_INTENSITY = 1;

const normalizeColor = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().toLowerCase();
  return /^#[0-9a-f]{6}$/.test(normalized) ? normalized : fallback;
};

const normalizeRoomShape = (value: unknown) => {
  return value === "square" ? "square" : DEFAULT_ROOM_SHAPE;
};

const normalizeLightIntensity = (value: unknown) => {
  if (typeof value !== "number" || Number.isNaN(value)) return DEFAULT_LIGHT_INTENSITY;
  return Math.min(2, Math.max(0.2, value));
};

const normalizeDimension = (value: unknown, fallback: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return value;
};

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
    const {
      title,
      roomWidthFeet,
      roomHeightFeet,
      roomLengthFeet,
      wallHeightFeet,
      roomShape,
      wallColor,
      floorColor,
      lightIntensity,
      furniture,
    } = body;

    const normalizedRoomWidth = normalizeDimension(roomWidthFeet, 12);
    const normalizedRoomLength = normalizeDimension(roomLengthFeet, normalizeDimension(roomHeightFeet, 10));
    const normalizedWallHeight = normalizeDimension(wallHeightFeet, 9);

    const design = await Design.create({
      userId: user._id,
      title,
      roomWidthFeet: normalizedRoomWidth,
      roomHeightFeet: normalizedRoomLength,
      roomLengthFeet: normalizedRoomLength,
      wallHeightFeet: normalizedWallHeight,
      roomShape: normalizeRoomShape(roomShape),
      wallColor: normalizeColor(wallColor, DEFAULT_WALL_COLOR),
      floorColor: normalizeColor(floorColor, DEFAULT_FLOOR_COLOR),
      lightIntensity: normalizeLightIntensity(lightIntensity),
      furniture,
    });

    return NextResponse.json(design, { status: 201 });

  } catch (error) {
    console.error("Save design error:", error);
    const details =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to save design", details },
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
