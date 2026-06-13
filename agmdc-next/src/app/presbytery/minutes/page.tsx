import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FileExplorer from "@/components/FileExplorer";

export default async function MinutesDashboard() {
  const minutes = await prisma.meetingMinute.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
            Document Management
          </h1>
          <p className="text-slate-400 mt-2">Manage and review Section Committee Meeting Minutes.</p>
        </div>
        <Link 
          href="/presbytery/minutes/create" 
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-indigo-500/20 transition flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create / Upload</span>
        </Link>
      </header>

      <FileExplorer minutes={minutes} />
    </div>
  );
}
