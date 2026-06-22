"use client";

import React, { useState } from "react";
import EditableGrid from "./EditableGrid";
import DataImporter from "./DataImporter";
import { saveTransfers } from "@/app/actions/dataActions";

interface TransfersClientProps {
  initialTransfers: any[];
  customFieldDefinitions: any[];
  users: any[];
  churches: any[];
  sections: any[];
}

export default function TransfersClient({
  initialTransfers,
  customFieldDefinitions,
  users,
  churches,
  sections,
}: TransfersClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "grid" | "import">("overview");

  // Options for entity (user or church)
  const entityOptions = [
    ...users.map((u) => `${u.name} (${u.role})`),
    ...churches.map((c) => `${c.name} (CHURCH)`),
  ];

  // Options for source / destination (church or section)
  const locationOptions = [
    ...churches.map((c) => `${c.name} (CHURCH)`),
    ...sections.map((s) => `${s.name} (SECTION)`),
  ];

  // Grid columns
  const columns = [
    {
      key: "type",
      label: "Transfer Type",
      type: "select" as const,
      options: ["PASTOR", "CHURCH", "MEMBER"],
    },
    {
      key: "entityId",
      label: "Transfer Entity (Pastor/Member/Church)",
      type: "select" as const,
      options: entityOptions,
    },
    {
      key: "fromId",
      label: "From (Church/Section)",
      type: "select" as const,
      options: locationOptions,
    },
    {
      key: "toId",
      label: "To (Church/Section)",
      type: "select" as const,
      options: locationOptions,
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: ["PENDING_PRESBYTER", "PENDING_REGIONAL_APPROVAL", "PENDING_EC_APPROVAL", "APPROVED", "REJECTED"],
    },
  ];

  // Importer DB fields mapping
  const dbFields = [
    { key: "type", label: "Transfer Type (PASTOR/CHURCH/MEMBER)" },
    { key: "entityId", label: "Entity Name or ID" },
    { key: "fromId", label: "From Name or ID" },
    { key: "toId", label: "To Name or ID" },
    { key: "status", label: "Status" },
  ];

  const renderOverview = () => {
    return (
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
                {customFieldDefinitions.map((cf) => (
                  <th key={cf.id} className="pb-3">{cf.fieldName}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {initialTransfers.map((tr, i) => {
                let customVals: Record<string, any> = {};
                if (tr.customFields) {
                  try {
                    customVals = JSON.parse(tr.customFields);
                  } catch (e) {}
                }

                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-4 font-mono text-slate-500">{tr.id.substring(0, 8).toUpperCase()}</td>
                    <td className="py-4 font-semibold text-purple-400">{tr.typeClean}</td>
                    <td className="py-4 font-medium text-slate-200">{tr.entityName}</td>
                    <td className="py-4 text-slate-400">{tr.fromName}</td>
                    <td className="py-4 text-slate-400">{tr.toName}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          tr.status === "APPROVED" || tr.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : tr.status === "REJECTED" || tr.status === "Rejected"
                            ? "bg-rose-500/10 text-rose-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {tr.statusClean}
                      </span>
                    </td>
                    {customFieldDefinitions.map((cf) => (
                      <td key={cf.id} className="py-4 text-slate-400">
                        {customVals[cf.fieldName] || "-"}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {initialTransfers.length === 0 && (
                <tr>
                  <td colSpan={6 + customFieldDefinitions.length} className="text-center py-8 text-slate-500">
                    No transfers found. Use the "Spreadsheet Editor" or "Excel Importer" tabs to create some!
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-fuchsia-400">
            Transfers Portal
          </h1>
          <p className="text-slate-400 mt-2">Manage Pastor, Church, and Member relocation workflows.</p>
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
              Add rows, configure source and target links, and update statuses. Click "Save to Database" when done.
            </p>
          </div>
          <EditableGrid
            moduleName="Transfer"
            initialData={initialTransfers}
            customFieldDefinitions={customFieldDefinitions}
            columns={columns}
            onSave={saveTransfers}
          />
        </div>
      )}

      {activeTab === "import" && (
        <DataImporter moduleName="Transfer" dbFields={dbFields} onImportComplete={saveTransfers} />
      )}
    </div>
  );
}
