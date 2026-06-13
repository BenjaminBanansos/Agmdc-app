"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createMeetingMinute(data: {
  title: string;
  folderName: string;
  content?: string;
  fileUrl?: string;
}) {
  // Hardcoding sectionId for now since auth mock requires a valid section.
  // In production, this would come from session.user.sectionId
  
  // First, find or create a default section if it doesn't exist
  let section = await prisma.section.findFirst();
  
  if (!section) {
    const region = await prisma.region.create({
      data: { name: "Default Region" }
    });
    section = await prisma.section.create({
      data: { name: "Default Section", regionId: region.id }
    });
  }

  await prisma.meetingMinute.create({
    data: {
      title: data.title,
      folderName: data.folderName || "General",
      content: data.content,
      fileUrl: data.fileUrl,
      sectionId: section.id,
    },
  });

  revalidatePath("/presbytery/minutes");
  return { success: true };
}
