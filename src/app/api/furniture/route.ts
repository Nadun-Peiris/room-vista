import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { Furniture } from "@/models/Furniture";
import { User } from "@/models/User";

type AuthorizedUserResult =
  | { ok: true; role: "superadmin" | "designer"; status: "pending" | "active" | "inactive" }
  | { ok: false; response: NextResponse };

async function getAuthorizedUser(req: NextRequest): Promise<AuthorizedUserResult> {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const decoded = await adminAuth.verifyIdToken(token);
  const user = await User.findOne({ firebaseUid: decoded.uid });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  return { ok: true, role: user.role, status: user.status };
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const auth = await getAuthorizedUser(req);
    if (!auth.ok) return auth.response;
    if (auth.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

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
    const auth = await getAuthorizedUser(req);
    if (!auth.ok) return auth.response;
    if (auth.status !== "active") {
      return NextResponse.json({ error: "Account not activated by admin" }, { status: 403 });
    }

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
    const auth = await getAuthorizedUser(req);
    if (!auth.ok) return auth.response;
    if (auth.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

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
