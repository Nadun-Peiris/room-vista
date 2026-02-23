import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { adminAuth } from "@/lib/firebase-admin";
import { Furniture } from "@/models/Furniture";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await adminAuth.verifyIdToken(token);

    const {
      id,
      name,
      category,
      widthInches,
      depthInches,
      heightFeet,
      modelUrl,
      thumbnailUrl,
    } = await req.json();

    const updateData: any = {
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
