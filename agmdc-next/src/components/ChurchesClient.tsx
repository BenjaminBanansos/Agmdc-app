"use client";

import React, { useState } from "react";
import EditableGrid from "./EditableGrid";
import DataImporter from "./DataImporter";
import { saveChurches } from "@/app/actions/dataActions";

interface ChurchesClientProps {
  initialChurches: any[];
  customFieldDefinitions: any[];
  sections: any[];
}

export default function ChurchesClient({
  initialChurches,
  customFieldDefinitions,
  sections,
}: ChurchesClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "grid" | "import">("overview");

  // Grid columns
  const columns = [
    { key: "name", label: "Church Name", type: "text" as const },
    {
      key: "sectionId",
      label: "Section",
      type: "select" as const,
      options: sections.map((s) => `${s.name} (${s.id.substring(0, 8).toUpperCase()})`),
    },
    { key: "isRecognized", label: "Recognized", type: "boolean" as const },
  ];

  // Importer DB fields mapping
  const dbFields = [
    { key: "name", label: "Church Name" },
    { key: "sectionId", label: "Section ID or Name" },
    { key: "isRecognized", label: "Is Recognized (Yes/No or True/False)" },
  ];

  const renderOverview = () => {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3">ID</th>
                <th className="pb-3">Church Name</th>
                <th className="pb-3">Section</th>
                <th className="pb-3">Assigned Pastor</th>
                <th className="pb-3">Members</th>
                <th className="pb-3">Status</th>
                {customFieldDefinitions.map((cf) => (
                  <th key={cf.id} className="pb-3">{cf.fieldName}</th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {initialChurches.map((c, i) => {
                let customVals: Record<string, any> = {};
                if (c.customFields) {
                  try {
                    customVals = JSON.parse(c.customFields);
                  } catch (e) {}
                }

                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-4 font-mono text-slate-500">{c.id.substring(0, 8).toUpperCase()}</td>
                    <td className="py-4 font-medium text-slate-200">{c.name}</td>
                    <td className="py-4 text-slate-400">{c.section}</td>
                    <td className="py-4 text-slate-400">{c.pastor}</td>
                    <td className="py-4 text-slate-400">{c.members}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          c.recognized ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                        }`}
                      >
                        {c.recognized ? "Recognized" : "Unrecognized"}
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
              {initialChurches.length === 0 && (
                <tr>
                  <td colSpan={6 + customFieldDefinitions.length} className="text-center py-8 text-slate-500">
                    No churches found. Use the "Spreadsheet Editor" or "Excel Importer" tabs to add some!
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            Churches Directory
          </h1>
          <p className="text-slate-400 mt-2">Manage local churches, section assignments, and custom fields.</p>
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
              Add rows, select sections, or add custom columns. Remember to click "Save to Database" when done.
            </p>
          </div>
          <EditableGrid
            moduleName="Church"
            initialData={initialChurches}
            customFieldDefinitions={customFieldDefinitions}
            columns={columns}
            onSave={saveChurches}
          />
        </div>
      )}

      {activeTab === "import" && (
        <DataImporter moduleName="Church" dbFields={dbFields} onImportComplete={saveChurches} />
      )}
    </div>
  );
}
