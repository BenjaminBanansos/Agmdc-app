import React from "react";
import { prisma } from "@/lib/prisma";
import { getCustomFieldDefinitions } from "@/app/actions/dataActions";
import TransfersClient from "@/components/TransfersClient";

export default async function TransfersModule() {
  const dbTransfers = await prisma.transfer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const customFields = await getCustomFieldDefinitions("Transfer");
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" }
  });
  const churches = await prisma.church.findMany({
    orderBy: { name: "asc" }
  });
  const sections = await prisma.section.findMany({
    orderBy: { name: "asc" }
  });

  const initialTransfers = await Promise.all(
    dbTransfers.map(async (tr) => {
      let entityName = "Unknown";
      let fromName = "Unknown";
      let toName = "Unknown";

      let entityIdFormatted = tr.entityId;
      let fromIdFormatted = tr.fromId;
      let toIdFormatted = tr.toId;

      if (tr.type === "PASTOR" || tr.type === "MEMBER") {
        const user = await prisma.user.findUnique({ where: { id: tr.entityId } });
        if (user) {
          entityName = user.name;
          entityIdFormatted = `${user.name} (${user.role})`;
        }
        
        const fromChurch = await prisma.church.findUnique({ where: { id: tr.fromId } });
        if (fromChurch) {
          fromName = fromChurch.name;
          fromIdFormatted = `${fromChurch.name} (CHURCH)`;
        }
        const toChurch = await prisma.church.findUnique({ where: { id: tr.toId } });
        if (toChurch) {
          toName = toChurch.name;
          toIdFormatted = `${toChurch.name} (CHURCH)`;
        }
      } else if (tr.type === "CHURCH") {
        const church = await prisma.church.findUnique({ where: { id: tr.entityId } });
        if (church) {
          entityName = church.name;
          entityIdFormatted = `${church.name} (CHURCH)`;
        }

        const fromSection = await prisma.section.findUnique({ where: { id: tr.fromId } });
        if (fromSection) {
          fromName = fromSection.name;
          fromIdFormatted = `${fromSection.name} (SECTION)`;
        }
        const toSection = await prisma.section.findUnique({ where: { id: tr.toId } });
        if (toSection) {
          toName = toSection.name;
          toIdFormatted = `${toSection.name} (SECTION)`;
        }
      }

      return {
        id: tr.id,
        type: tr.type || "PASTOR",
        entityId: entityIdFormatted,
        fromId: fromIdFormatted,
        toId: toIdFormatted,
        status: tr.status || "PENDING_PRESBYTER",
        customFields: tr.customFields || null,
        // UI Helpers
        typeClean: tr.type === "PASTOR" ? "Pastor Transfer" : tr.type === "MEMBER" ? "Member Transfer" : "Church Transfer",
        entityName,
        fromName,
        toName,
        statusClean: tr.status ? tr.status.replace(/_/g, " ") : "Pending",
      };
    })
  );

  return (
    <TransfersClient
      initialTransfers={initialTransfers}
      customFieldDefinitions={customFields}
      users={users}
      churches={churches}
      sections={sections}
    />
  );
}
