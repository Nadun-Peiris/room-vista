import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { adminAuth } from "@/lib/firebase-admin";
import { Furniture } from "@/models/Furniture";
import { User } from "@/models/User";

type FurnitureUpdatePayload = {
  id?: string;
  name?: string;
  category?: string;
  widthInches?: number;
  depthInches?: number;
  heightFeet?: number;
  modelUrl?: string;
  thumbnailUrl?: string;
};

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const currentUser = await User.findOne({ firebaseUid: decoded.uid });
    if (!currentUser || currentUser.role !== "superadmin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const {
      id,
      name,
      category,
      widthInches,
      depthInches,
      heightFeet,
      modelUrl,
      thumbnailUrl,
    } = (await req.json()) as FurnitureUpdatePayload;

    if (!id) {
      return NextResponse.json({ error: "Missing furniture id" }, { status: 400 });
    }

    const updateData: Partial<FurnitureUpdatePayload> = {
      name,
      category,
      widthInches,
      depthInches,
      heightFeet,
    };

    if (modelUrl) updateData.modelUrl = modelUrl;
    if (thumbnailUrl) updateData.thumbnailUrl = thumbnailUrl;

    await Furniture.findByIdAndUpdate(id, updateData);

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
