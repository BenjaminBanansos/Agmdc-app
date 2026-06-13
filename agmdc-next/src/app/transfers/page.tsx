import React from "react";
import { prisma } from "@/lib/prisma";

export default async function TransfersModule() {
  const dbTransfers = await prisma.transfer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const transfers = await Promise.all(
    dbTransfers.map(async tr => {
      let entityName = "Unknown";
      let fromName = "Unknown";
      let toName = "Unknown";

      if (tr.type === "PASTOR" || tr.type === "MEMBER") {
        const user = await prisma.user.findUnique({ where: { id: tr.entityId } });
        if (user) entityName = user.name;
        
        // Resolve from/to churches
        const fromChurch = await prisma.church.findUnique({ where: { id: tr.fromId } });
        if (fromChurch) fromName = fromChurch.name;
        const toChurch = await prisma.church.findUnique({ where: { id: tr.toId } });
        if (toChurch) toName = toChurch.name;
      } else if (tr.type === "CHURCH") {
        const church = await prisma.church.findUnique({ where: { id: tr.entityId } });
        if (church) entityName = church.name;

        // Resolve from/to sections
        const fromSection = await prisma.section.findUnique({ where: { id: tr.fromId } });
        if (fromSection) fromName = fromSection.name;
        const toSection = await prisma.section.findUnique({ where: { id: tr.toId } });
        if (toSection) toName = toSection.name;
      }

      return {
        id: tr.id.substring(0, 8).toUpperCase(),
        type: tr.type === "PASTOR" ? "Pastor Transfer" : tr.type === "MEMBER" ? "Member Transfer" : "Church Transfer",
        entity: entityName,
        from: fromName,
        to: toName,
        status: tr.status.replace(/_/g, " "),
      };
    })
  );

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
            Transfers Portal
          </h1>
          <p className="text-slate-400 mt-2">Manage Pastor, Church, and Member relocation workflows.</p>
        </div>
        <button className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-purple-500/20">
          Initiate Transfer
        </button>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Active Transfer Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3">Ref ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Entity</th>
                <th className="pb-3">From</th>
                <th className="pb-3">To</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {transfers.map((tr, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 font-mono text-slate-500">{tr.id}</td>
                  <td className="py-4 font-semibold text-purple-400">{tr.type}</td>
                  <td className="py-4 font-medium text-slate-200">{tr.entity}</td>
                  <td className="py-4 text-slate-400">{tr.from}</td>
                  <td className="py-4 text-slate-400">{tr.to}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${tr.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
