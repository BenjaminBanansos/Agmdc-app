import React from "react";
import { prisma } from "@/lib/prisma";
import { getCustomFieldDefinitions } from "@/app/actions/dataActions";
import RegionsClient from "@/components/RegionsClient";

export default async function RegionsModule() {
  const dbRegions = await prisma.region.findMany({
    include: {
      sections: {
        include: {
          churches: true,
        },
      },
      users: true,
    },
  });

  const customFields = await getCustomFieldDefinitions("Region");
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" }
  });

  const initialRegions = dbRegions.map(r => {
    // Find a regional director if assigned, or default to TBD
    const directorUser = r.users.find(u => u.role === "REGIONAL_DIRECTOR");
    const directorName = directorUser ? directorUser.name : "Rev. TBD";

    // Calculate total churches recursively across all sections in the region
    const totalChurches = r.sections.reduce((acc, sec) => acc + sec.churches.length, 0);

    // Map a growth placeholder based on the region
    const growth = r.name.includes("South") ? "+2.1%" : r.name.includes("Central") ? "+3.4%" : "+1.8%";

    return {
      id: r.id,
      name: r.name,
      directorId: r.directorId || "",
      director: directorName,
      sections: r.sections.length,
      churches: totalChurches,
      growth,
      customFields: r.customFields || null
    };
  });

  return (
    <RegionsClient
      initialRegions={initialRegions}
      customFieldDefinitions={customFields}
      users={users}
    />
  );
}
