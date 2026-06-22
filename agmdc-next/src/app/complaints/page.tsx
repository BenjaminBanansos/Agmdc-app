import React from "react";
import { prisma } from "@/lib/prisma";
import { getCustomFieldDefinitions } from "@/app/actions/dataActions";
import ComplaintsClient from "@/components/ComplaintsClient";

export default async function ComplaintsModule() {
  const dbComplaints = await prisma.complaint.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const customFields = await getCustomFieldDefinitions("Complaint");
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" }
  });

  const initialComplaints = dbComplaints.map(c => {
    const timeDiff = Math.abs(Date.now() - new Date(c.createdAt).getTime());
    const daysOpen = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    return {
      id: c.id,
      refNumber: c.refNumber,
      ref: c.refNumber,
      title: c.title,
      description: c.description || "",
      level: c.level,
      status: c.status,
      submitterId: c.submitterId || "",
      daysOpen: daysOpen,
      customFields: c.customFields || null
    };
  });

  return (
    <ComplaintsClient
      initialComplaints={initialComplaints}
      customFieldDefinitions={customFields}
      users={users}
    />
  );
}
