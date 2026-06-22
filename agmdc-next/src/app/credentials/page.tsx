import React from "react";
import { prisma } from "@/lib/prisma";
import { getCustomFieldDefinitions } from "@/app/actions/dataActions";
import CredentialsClient from "@/components/CredentialsClient";

export default async function CredentialsModule() {
  const dbApplications = await prisma.credentialApplication.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customFields = await getCustomFieldDefinitions("CredentialApplication");
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" }
  });

  const initialApplications = dbApplications.map(app => {
    // Compute current step (1 to 4) based on approval flow flags
    let step = 1;
    if (app.presbyterApproved) step = 2;
    if (app.regionalApproved) step = 3;
    if (app.ecApproved) step = 4;

    const userName = app.user ? app.user.name : "Unknown Applicant";
    const userRole = app.user ? app.user.role : "";

    return {
      id: app.id,
      userId: app.user ? `${app.user.name} (${app.user.role})` : "",
      levelRequested: app.levelRequested,
      status: app.status || "PENDING_PRESBYTER",
      presbyterApproved: app.presbyterApproved,
      regionalApproved: app.regionalApproved,
      ecApproved: app.ecApproved,
      customFields: app.customFields || null,
      name: userName,
      requested: app.levelRequested ? app.levelRequested.replace(/_/g, " ") : "LICENSE TO PREACH",
      step: step
    };
  });

  return (
    <CredentialsClient
      initialApplications={initialApplications}
      customFieldDefinitions={customFields}
      users={users}
    />
  );
}
