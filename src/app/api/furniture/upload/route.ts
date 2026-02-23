import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    await adminAuth.verifyIdToken(token);

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
    const modelUpload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "room-vista/models",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(modelBuffer);
    });

    // Upload Thumbnail
    const thumbnailUpload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "room-vista/thumbnails",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
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