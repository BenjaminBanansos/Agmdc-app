"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createFolder(folderName: string) {
  let section = await prisma.section.findFirst();
  if (!section) {
    const region = await prisma.region.create({ data: { name: "Default Region" } });
    section = await prisma.section.create({ data: { name: "Default Section", regionId: region.id } });
  }

  await prisma.meetingMinute.create({
    data: {
      title: "__folder__",
      folderName: folderName,
      isFolder: true,
      sectionId: section.id,
    },
  });

  revalidatePath("/presbytery/minutes");
  return { success: true };
}
