import React from "react";
import { prisma } from "@/lib/prisma";

export default async function ExecutiveDashboard() {
  // 1. Fetch live data from the SQLite Database
  const churchesCount = await prisma.church.count();
  const pastorsCount = await prisma.user.count({ where: { role: "PASTOR" } });
  const openComplaintsCount = await prisma.complaint.count({ where: { status: "OPEN" } });
  const regionsCount = await prisma.region.count();

  // 2. Fetch recent complaints dynamically
  const recentComplaints = await prisma.complaint.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { submitter: true }
  });

  const stats = [
    { label: "Active Regions", value: regionsCount.toString(), trend: "Structural Setup" },
    { label: "Registered Churches", value: churchesCount.toString(), trend: "+ Live Database" },
    { label: "Open Complaints", value: openComplaintsCount.toString(), trend: "Needs Attention" },
    { label: "Credentialed Pastors", value: pastorsCount.toString(), trend: "Verified" },
  ];

  return (
    <div className="py-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
            Executive Committee
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base">
            Live database connection active. Showing real-time aggregates.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20">
            Add New Church
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="group relative bg-white/[0.02] backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/[0.04] transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10"
          >
            <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
            <div className="text-3xl font-bold text-slate-100 mb-2">{stat.value}</div>
            <div className="text-xs font-medium text-emerald-400 bg-emerald-400/10 inline-block px-2 py-1 rounded-full">
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Database Entries Section */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-rose-500 mr-3"></span>
              Live Complaints Feed (SQLite DB)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-sm">
                    <th className="pb-3 font-medium">Ref Number</th>
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">Submitter</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {recentComplaints.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-slate-500">No complaints found.</td></tr>
                  )}
                  {recentComplaints.map((comp) => (
                    <tr key={comp.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 font-mono text-slate-300">{comp.refNumber}</td>
                      <td className="py-4">{comp.title}</td>
                      <td className="py-4">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-amber-500/10 text-amber-400">
                          {comp.level}
                        </span>
                      </td>
                      <td className="py-4 text-slate-400">{comp.submitter?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
