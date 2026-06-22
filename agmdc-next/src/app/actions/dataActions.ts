"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- CUSTOM FIELD DEFINITIONS ---

export async function getCustomFieldDefinitions(moduleName: string) {
  try {
    return await prisma.customFieldDefinition.findMany({
      where: { moduleName },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error(`Error fetching custom fields for ${moduleName}:`, error);
    return [];
  }
}

export async function saveCustomFieldDefinition(moduleName: string, fieldName: string, fieldType: string) {
  try {
    // Check if it already exists
    const existing = await prisma.customFieldDefinition.findFirst({
      where: { moduleName, fieldName },
    });
    if (existing) return existing;

    const def = await prisma.customFieldDefinition.create({
      data: { moduleName, fieldName, fieldType },
    });
    return def;
  } catch (error) {
    console.error(`Error saving custom field definition:`, error);
    throw new Error("Failed to save custom column.");
  }
}

// --- UPSERT RECORD HELPERS ---

export async function saveRegions(regions: any[]) {
  try {
    for (const reg of regions) {
      const { id, name, directorId, customFields } = reg;
      const customFieldsStr = customFields ? JSON.stringify(customFields) : null;

      let validDirectorId = directorId;
      if (directorId) {
        const cleanName = directorId.split(" (")[0].trim();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { id: directorId },
              { name: { contains: cleanName } }
            ]
          }
        });
        if (user) {
          validDirectorId = user.id;
        }
      }

      if (id && id.length === 36) { // Check if valid UUID (existing record)
        await prisma.region.upsert({
          where: { id },
          update: { name, directorId: validDirectorId, customFields: customFieldsStr },
          create: { id, name, directorId: validDirectorId, customFields: customFieldsStr },
        });
      } else {
        await prisma.region.create({
          data: { name, directorId: validDirectorId, customFields: customFieldsStr },
        });
      }
    }
    revalidatePath("/regions");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving regions:", error);
    return { success: false, error: error.message };
  }
}

export async function saveChurches(churches: any[]) {
  try {
    for (const ch of churches) {
      const { id, name, sectionId, isRecognized, customFields } = ch;
      const customFieldsStr = customFields ? JSON.stringify(customFields) : null;

      let validSectionId = sectionId;
      if (sectionId) {
        // Try to find matching section by ID or name
        const sec = await prisma.section.findFirst({
          where: {
            OR: [
              { id: sectionId },
              { name: { contains: sectionId } }
            ]
          }
        });
        if (sec) {
          validSectionId = sec.id;
        } else {
          const firstSec = await prisma.section.findFirst();
          validSectionId = firstSec ? firstSec.id : null;
        }
      } else {
        const firstSec = await prisma.section.findFirst();
        validSectionId = firstSec ? firstSec.id : null;
      }

      if (!validSectionId) {
        throw new Error("No Section exists in the database. Please create a Section/Region first.");
      }

      if (id && id.length === 36) {
        await prisma.church.upsert({
          where: { id },
          update: { name, sectionId: validSectionId, isRecognized: !!isRecognized, customFields: customFieldsStr },
          create: { id, name, sectionId: validSectionId, isRecognized: !!isRecognized, customFields: customFieldsStr },
        });
      } else {
        await prisma.church.create({
          data: { name, sectionId: validSectionId, isRecognized: !!isRecognized, customFields: customFieldsStr },
        });
      }
    }
    revalidatePath("/churches");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving churches:", error);
    return { success: false, error: error.message };
  }
}

export async function saveComplaints(complaints: any[]) {
  try {
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      throw new Error("No User exists in the database. Please create a User first.");
    }

    for (const comp of complaints) {
      const { id, refNumber, title, description, level, status, submitterId, customFields } = comp;
      const customFieldsStr = customFields ? JSON.stringify(customFields) : null;
      const validSubmitterId = submitterId || defaultUser.id;
      const validRefNumber = refNumber || `COMP-${Math.floor(100 + Math.random() * 900)}`;

      if (id && id.length === 36) {
        await prisma.complaint.upsert({
          where: { id },
          update: { refNumber: validRefNumber, title, description, level, status, submitterId: validSubmitterId, customFields: customFieldsStr },
          create: { id, refNumber: validRefNumber, title, description, level, status, submitterId: validSubmitterId, customFields: customFieldsStr },
        });
      } else {
        await prisma.complaint.create({
          data: { refNumber: validRefNumber, title, description, level, status, submitterId: validSubmitterId, customFields: customFieldsStr },
        });
      }
    }
    revalidatePath("/complaints");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving complaints:", error);
    return { success: false, error: error.message };
  }
}

export async function saveCredentials(credentials: any[]) {
  try {
    const defaultUser = await prisma.user.findFirst();
    if (!defaultUser) {
      throw new Error("No User exists in the database. Please create a User first.");
    }

    for (const cred of credentials) {
      const { id, userId, levelRequested, status, presbyterApproved, regionalApproved, ecApproved, customFields } = cred;
      const customFieldsStr = customFields ? JSON.stringify(customFields) : null;
      
      let validUserId = userId;
      if (userId) {
        const cleanName = userId.split(" (")[0].trim();
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { id: userId },
              { name: { contains: cleanName } },
              { email: { contains: cleanName } }
            ]
          }
        });
        if (user) {
          validUserId = user.id;
        } else {
          validUserId = defaultUser.id;
        }
      } else {
        validUserId = defaultUser.id;
      }

      if (id && id.length === 36) {
        await prisma.credentialApplication.upsert({
          where: { id },
          update: {
            userId: validUserId,
            levelRequested: levelRequested || "LICENSE_TO_PREACH",
            status: status || "PENDING_PRESBYTER",
            presbyterApproved: !!presbyterApproved,
            regionalApproved: !!regionalApproved,
            ecApproved: !!ecApproved,
            customFields: customFieldsStr
          },
          create: {
            id,
            userId: validUserId,
            levelRequested: levelRequested || "LICENSE_TO_PREACH",
            status: status || "PENDING_PRESBYTER",
            presbyterApproved: !!presbyterApproved,
            regionalApproved: !!regionalApproved,
            ecApproved: !!ecApproved,
            customFields: customFieldsStr
          },
        });
      } else {
        await prisma.credentialApplication.create({
          data: {
            userId: validUserId,
            levelRequested: levelRequested || "LICENSE_TO_PREACH",
            status: status || "PENDING_PRESBYTER",
            presbyterApproved: !!presbyterApproved,
            regionalApproved: !!regionalApproved,
            ecApproved: !!ecApproved,
            customFields: customFieldsStr
          },
        });
      }
    }
    revalidatePath("/credentials");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving credentials:", error);
    return { success: false, error: error.message };
  }
}

export async function saveTransfers(transfers: any[]) {
  try {
    const defaultUser = await prisma.user.findFirst();
    const defaultChurch = await prisma.church.findFirst();
    if (!defaultUser || !defaultChurch) {
      throw new Error("Please ensure at least one User and one Church exist in the database to configure transfers.");
    }

    for (const tr of transfers) {
      const { id, type, entityId, fromId, toId, status, customFields } = tr;
      const customFieldsStr = customFields ? JSON.stringify(customFields) : null;
      
      let validEntityId = entityId;
      if (entityId) {
        const cleanEntity = entityId.split(" (")[0].trim();
        if (type === "PASTOR" || type === "MEMBER") {
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { id: entityId },
                { name: { contains: cleanEntity } }
              ]
            }
          });
          if (user) validEntityId = user.id;
        } else if (type === "CHURCH") {
          const church = await prisma.church.findFirst({
            where: {
              OR: [
                { id: entityId },
                { name: { contains: cleanEntity } }
              ]
            }
          });
          if (church) validEntityId = church.id;
        }
      } else {
        validEntityId = defaultUser.id;
      }

      let validFromId = fromId;
      if (fromId) {
        const cleanFrom = fromId.split(" (")[0].trim();
        if (type === "PASTOR" || type === "MEMBER") {
          const church = await prisma.church.findFirst({
            where: {
              OR: [
                { id: fromId },
                { name: { contains: cleanFrom } }
              ]
            }
          });
          if (church) validFromId = church.id;
        } else if (type === "CHURCH") {
          const section = await prisma.section.findFirst({
            where: {
              OR: [
                { id: fromId },
                { name: { contains: cleanFrom } }
              ]
            }
          });
          if (section) validFromId = section.id;
        }
      } else {
        validFromId = defaultChurch.id;
      }

      let validToId = toId;
      if (toId) {
        const cleanTo = toId.split(" (")[0].trim();
        if (type === "PASTOR" || type === "MEMBER") {
          const church = await prisma.church.findFirst({
            where: {
              OR: [
                { id: toId },
                { name: { contains: cleanTo } }
              ]
            }
          });
          if (church) validToId = church.id;
        } else if (type === "CHURCH") {
          const section = await prisma.section.findFirst({
            where: {
              OR: [
                { id: toId },
                { name: { contains: cleanTo } }
              ]
            }
          });
          if (section) validToId = section.id;
        }
      } else {
        validToId = defaultChurch.id;
      }

      if (id && id.length === 36) {
        await prisma.transfer.upsert({
          where: { id },
          update: {
            type: type || "PASTOR",
            entityId: validEntityId,
            fromId: validFromId,
            toId: validToId,
            status: status || "PENDING_PRESBYTER",
            customFields: customFieldsStr
          },
          create: {
            id,
            type: type || "PASTOR",
            entityId: validEntityId,
            fromId: validFromId,
            toId: validToId,
            status: status || "PENDING_PRESBYTER",
            customFields: customFieldsStr
          },
        });
      } else {
        await prisma.transfer.create({
          data: {
            type: type || "PASTOR",
            entityId: validEntityId,
            fromId: validFromId,
            toId: validToId,
            status: status || "PENDING_PRESBYTER",
            customFields: customFieldsStr
          },
        });
      }
    }
    revalidatePath("/transfers");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving transfers:", error);
    return { success: false, error: error.message };
  }
}

export async function updateRecordMetadata(
  modelName: string,
  id: string,
  updates: {
    notes?: string;
    assignedTo?: string;
    status?: string;
    level?: string;
    directorId?: string;
    sectionId?: string;
    churchId?: string;
    presbyterApproved?: boolean;
    regionalApproved?: boolean;
    ecApproved?: boolean;
  }
) {
  try {
    const modelKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);
    const prismaModel = (prisma as any)[modelKey];
    if (!prismaModel) {
      throw new Error(`Model ${modelName} not found in prisma client.`);
    }

    const currentRecord = await prismaModel.findUnique({ where: { id } });
    if (!currentRecord) {
      throw new Error(`Record with id ${id} not found in ${modelName}.`);
    }

    // Parse existing customFields
    let customVals: Record<string, any> = {};
    if (currentRecord.customFields) {
      try {
        customVals = JSON.parse(currentRecord.customFields);
      } catch (e) {}
    }

    // Update custom fields with notes and assignedTo if provided
    if (updates.notes !== undefined) {
      customVals.recommendNotes = updates.notes;
    }
    if (updates.assignedTo !== undefined) {
      customVals.assignedTo = updates.assignedTo;
    }

    // Build update data
    const data: Record<string, any> = {
      customFields: JSON.stringify(customVals)
    };

    // If there are direct database columns we want to update
    if (updates.status !== undefined && "status" in currentRecord) {
      data.status = updates.status;
    }
    if (updates.level !== undefined && "level" in currentRecord) {
      data.level = updates.level;
    }
    if (updates.directorId !== undefined && "directorId" in currentRecord) {
      data.directorId = updates.directorId || null;
    }
    if (updates.sectionId !== undefined && "sectionId" in currentRecord) {
      data.sectionId = updates.sectionId;
    }
    if (updates.churchId !== undefined && "churchId" in currentRecord) {
      data.churchId = updates.churchId || null;
    }
    if (updates.presbyterApproved !== undefined && "presbyterApproved" in currentRecord) {
      data.presbyterApproved = updates.presbyterApproved;
    }
    if (updates.regionalApproved !== undefined && "regionalApproved" in currentRecord) {
      data.regionalApproved = updates.regionalApproved;
    }
    if (updates.ecApproved !== undefined && "ecApproved" in currentRecord) {
      data.ecApproved = updates.ecApproved;
    }

    // Save changes
    const updated = await prismaModel.update({
      where: { id },
      data
    });

    // Revalidate paths to reflect updates
    revalidatePath("/ec");
    revalidatePath("/regions");
    revalidatePath("/churches");
    revalidatePath("/complaints");
    revalidatePath("/credentials");
    revalidatePath("/transfers");

    return { success: true, record: updated };
  } catch (error: any) {
    console.error(`Error updating metadata for ${modelName}:`, error);
    return { success: false, error: error.message };
  }
}
