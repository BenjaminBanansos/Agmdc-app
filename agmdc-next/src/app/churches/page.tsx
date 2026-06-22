import React from "react";
import { prisma } from "@/lib/prisma";
import { getCustomFieldDefinitions } from "@/app/actions/dataActions";
import ChurchesClient from "@/components/ChurchesClient";

export default async function ChurchesModule() {
  const dbChurches = await prisma.church.findMany({
    include: {
      section: true,
      users: true,
      annualReturns: {
        orderBy: {
          year: "desc",
        },
        take: 1,
      },
    },
  });

  const customFields = await getCustomFieldDefinitions("Church");
  const sections = await prisma.section.findMany({
    orderBy: { name: "asc" }
  });

  const initialChurches = dbChurches.map(c => {
    // Find a user in this church whose role is PASTOR
    const pastorUser = c.users.find(u => u.role === "PASTOR");
    const pastorName = pastorUser ? pastorUser.name : "No Pastor Assigned";

    // Get the member count from the latest annual return, or default to users list size
    const latestReturn = c.annualReturns[0];
    const members = latestReturn ? latestReturn.membersCount : c.users.length;

    return {
      id: c.id,
      name: c.name,
      sectionId: c.sectionId || "",
      section: c.section ? c.section.name : "Unassigned",
      pastor: pastorName,
      members: members,
      recognized: c.isRecognized,
      customFields: c.customFields || null
    };
  });

  return (
    <ChurchesClient
      initialChurches={initialChurches}
      customFieldDefinitions={customFields}
      sections={sections}
    />
  );
}
