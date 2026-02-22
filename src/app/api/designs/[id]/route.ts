import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Design } from "@/models/Design";

interface RouteContext {
  params: Promise<{ id: string }>;
}

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
    const { title, roomWidthFeet, roomHeightFeet, furniture } = await req.json();

    const updated = await Design.findOneAndUpdate(
      { _id: id, userId: user._id },
      {
        ...(typeof title === "string" ? { title } : {}),
        ...(typeof roomWidthFeet === "number" ? { roomWidthFeet } : {}),
        ...(typeof roomHeightFeet === "number" ? { roomHeightFeet } : {}),
        ...(Array.isArray(furniture) ? { furniture } : {}),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Update design error:", error);
    return NextResponse.json(
      { error: "Failed to update design" },
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
