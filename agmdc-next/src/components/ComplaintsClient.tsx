"use client";

import React, { useState } from "react";
import EditableGrid from "./EditableGrid";
import DataImporter from "./DataImporter";
import { saveComplaints } from "@/app/actions/dataActions";

interface ComplaintsClientProps {
  initialComplaints: any[];
  customFieldDefinitions: any[];
  users: any[];
}

export default function ComplaintsClient({
  initialComplaints,
  customFieldDefinitions,
  users,
}: ComplaintsClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "grid" | "import">("overview");

  // Grid columns
  const columns = [
    { key: "refNumber", label: "Ref ID", type: "text" as const },
    { key: "title", label: "Subject", type: "text" as const },
    { key: "description", label: "Details", type: "text" as const },
    {
      key: "level",
      label: "Authority Level",
      type: "select" as const,
      options: ["SECTION", "REGIONAL", "EXECUTIVE", "TRIBUNAL"],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: ["OPEN", "RESOLVED", "DISMISSED"],
    },
    {
      key: "submitterId",
      label: "Submitter",
      type: "select" as const,
      options: users.map((u) => `${u.name} (${u.role})`),
    },
  ];

  // Importer DB fields mapping
  const dbFields = [
    { key: "refNumber", label: "Reference Number" },
    { key: "title", label: "Subject" },
    { key: "description", label: "Details" },
    { key: "level", label: "Authority Level (SECTION/REGIONAL/EXECUTIVE/TRIBUNAL)" },
    { key: "status", label: "Status (OPEN/RESOLVED/DISMISSED)" },
    { key: "submitterId", label: "Submitter User ID or Name" },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case "SECTION":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "REGIONAL":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      case "EXECUTIVE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "TRIBUNAL":
        return "bg-red-500/20 text-red-500 border-red-500/30 font-bold";
      default:
        return "bg-slate-500/10 text-slate-400";
    }
  };

  const renderOverview = () => {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Active Escalations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3">Ref ID</th>
                <th className="pb-3">Subject</th>
                <th className="pb-3">Current Authority Level</th>
                <th className="pb-3">Days Open</th>
                <th className="pb-3">Status</th>
                {customFieldDefinitions.map((cf) => (
                  <th key={cf.id} className="pb-3">{cf.fieldName}</th>
                ))}
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {initialComplaints.map((c, i) => {
                let customVals: Record<string, any> = {};
                if (c.customFields) {
                  try {
                    customVals = JSON.parse(c.customFields);
                  } catch (e) {}
                }

                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-4 font-mono text-slate-500">{c.ref}</td>
                    <td className="py-4 font-medium text-slate-200">{c.title}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getLevelColor(c.level)}`}>
                        {c.level}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{c.daysOpen} days</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded text-xs ${c.status === "OPEN" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                        {c.status}
                      </span>
                    </td>
                    {customFieldDefinitions.map((cf) => (
                      <td key={cf.id} className="py-4 text-slate-400">
                        {customVals[cf.fieldName] || "-"}
                      </td>
                    ))}
                    <td className="py-4">
                      <button className="text-indigo-400 hover:text-indigo-300">View / Escalate</button>
                    </td>
                  </tr>
                );
              })}
              {initialComplaints.length === 0 && (
                <tr>
                  <td colSpan={7 + customFieldDefinitions.length} className="text-center py-8 text-slate-500">
                    No complaints found. Use the "Spreadsheet Editor" or "Excel Importer" tabs to file some!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-white/10 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-red-500">
            Complaints & Escalation
          </h1>
          <p className="text-slate-400 mt-2">Manage grievance workflows across all levels of the District Council.</p>
        </div>

        {/* Navigation */}
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1.5 space-x-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "overview" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("grid")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "grid" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Spreadsheet Editor
          </button>
          <button
            onClick={() => setActiveTab("import")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "import" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"
            }`}
          >
            Excel Importer
          </button>
        </div>
      </header>

      {activeTab === "overview" && renderOverview()}

      {activeTab === "grid" && (
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-indigo-400">Interactive Spreadsheet Editor</h3>
            <p className="text-xs text-slate-400 mt-1">
              File complaints, assign submitters, or define custom fields. Click "Save to Database" to apply changes.
            </p>
          </div>
          <EditableGrid
            moduleName="Complaint"
            initialData={initialComplaints}
            customFieldDefinitions={customFieldDefinitions}
            columns={columns}
            onSave={saveComplaints}
          />
        </div>
      )}

      {activeTab === "import" && (
        <DataImporter moduleName="Complaint" dbFields={dbFields} onImportComplete={saveComplaints} />
      )}
    </div>
  );
}
