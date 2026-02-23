import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { adminAuth } from "@/lib/firebase-admin";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export async function POST(req: NextRequest) {
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

    const formData = await req.formData();

    const modelFile = formData.get("model") as File;
    const thumbnailFile = formData.get("thumbnail") as File;

    if (!modelFile || !thumbnailFile) {
      return NextResponse.json(
        { error: "Files missing" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const modelBuffer = Buffer.from(await modelFile.arrayBuffer());
    const thumbnailBuffer = Buffer.from(await thumbnailFile.arrayBuffer());

    // Upload GLB
    const modelUpload = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "room-vista/models",
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Model upload failed"));
        }
      ).end(modelBuffer);
    });

    // Upload Thumbnail
    const thumbnailUpload = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "room-vista/thumbnails",
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) reject(error);
          else if (result) resolve(result);
          else reject(new Error("Thumbnail upload failed"));
        }
      ).end(thumbnailBuffer);
    });

    return NextResponse.json({
      modelUrl: modelUpload.secure_url,
      thumbnailUrl: thumbnailUpload.secure_url,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
