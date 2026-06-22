import React from "react";
import { prisma } from "@/lib/prisma";
import ECClient from "@/components/ECClient";

export default async function ExecutiveDashboard() {
  // 1. Fetch all datasets from SQLite database
  const regions = await prisma.region.findMany({
    orderBy: { name: "asc" }
  });
  
  const churches = await prisma.church.findMany({
    orderBy: { name: "asc" }
  });
  
  const complaints = await prisma.complaint.findMany({
    include: { submitter: true },
    orderBy: { createdAt: "desc" }
  });

  const credentials = await prisma.credentialApplication.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  const transfers = await prisma.transfer.findMany({
    orderBy: { createdAt: "desc" }
  });

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" }
  });

  const sections = await prisma.section.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="py-8">
      {/* Page Header */}
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Superintendent BI Governance Deck
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Executive control panel for all districts, churches, complaints, credentials, and pastoral transfers.
          </p>
        </div>
      </header>

      {/* Renders the BI Deck Client with all datasets */}
      <ECClient
        initialRegions={regions}
        initialChurches={churches}
        initialComplaints={complaints}
        initialCredentials={credentials}
        initialTransfers={transfers}
        users={users}
        sections={sections}
        churches={churches}
      />
    </div>
  );
}
