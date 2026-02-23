import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Design } from "@/models/Design";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

async function getAuthorizedUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const token = authHeader.split(" ")[1];
  const decoded = await adminAuth.verifyIdToken(token);
  const user = await User.findOne({ firebaseUid: decoded.uid });

  if (!user) {
    return { error: NextResponse.json({ error: "User not found" }, { status: 404 }) };
  }

  return { user };
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { user, error } = await getAuthorizedUser(req);
    if (error) {
      return error;
    }

    const { id } = await context.params;
    const design = await Design.findOne({ _id: id, userId: user._id });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json(design, { status: 200 });
  } catch (error) {
    console.error("Fetch single design error:", error);
    return NextResponse.json(
      { error: "Failed to fetch design" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { user, error } = await getAuthorizedUser(req);
    if (error) {
      return error;
    }

    const { id } = await context.params;
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

    const normalizedRoomLength =
      roomLengthFeet !== undefined
        ? normalizeDimension(roomLengthFeet, 10)
        : roomHeightFeet !== undefined
          ? normalizeDimension(roomHeightFeet, 10)
          : undefined;

    const updated = await Design.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        ...(typeof title === "string" ? { title } : {}),
        ...(typeof roomWidthFeet === "number" ? { roomWidthFeet } : {}),
        ...(normalizedRoomLength !== undefined
          ? {
              roomHeightFeet: normalizedRoomLength,
              roomLengthFeet: normalizedRoomLength,
            }
          : {}),
        ...(wallHeightFeet !== undefined
          ? { wallHeightFeet: normalizeDimension(wallHeightFeet, 9) }
          : {}),
        ...(roomShape !== undefined ? { roomShape: normalizeRoomShape(roomShape) } : {}),
        ...(wallColor !== undefined ? { wallColor: normalizeColor(wallColor, DEFAULT_WALL_COLOR) } : {}),
        ...(floorColor !== undefined ? { floorColor: normalizeColor(floorColor, DEFAULT_FLOOR_COLOR) } : {}),
        ...(lightIntensity !== undefined ? { lightIntensity: normalizeLightIntensity(lightIntensity) } : {}),
        ...(Array.isArray(furniture) ? { furniture } : {}),
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Update design error:", error);
    const details =
      error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json(
      { error: "Failed to update design", details },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    await connectDB();

    const { user, error } = await getAuthorizedUser(req);
    if (error) {
      return error;
    }

    const { id } = await context.params;
    const deleted = await Design.findOneAndDelete({ _id: id, userId: user._id });

    if (!deleted) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Design deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete design error:", error);
    return NextResponse.json(
      { error: "Failed to delete design" },
      { status: 500 }
    );
  }
}
