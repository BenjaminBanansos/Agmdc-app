import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to prevent collisions
    const uniqueId = uuidv4();
    const extension = path.extname(file.name);
    const filename = `${uniqueId}${extension}`;

    // Save to public/uploads/minutes directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "minutes");
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    await writeFile(filePath, buffer);

    // Return the URL path for the database
    const fileUrl = `/uploads/minutes/${filename}`;

    return NextResponse.json({ fileUrl, originalName: file.name, success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
