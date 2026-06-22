"use client";

import React, { useState } from "react";
import EditableGrid from "./EditableGrid";
import DataImporter from "./DataImporter";
import { saveRegions } from "@/app/actions/dataActions";

interface RegionsClientProps {
  initialRegions: any[];
  customFieldDefinitions: any[];
  users: any[];
}

export default function RegionsClient({
  initialRegions,
  customFieldDefinitions,
  users,
}: RegionsClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "grid" | "import">("overview");

  // Format standard columns for the grid
  const columns = [
    { key: "name", label: "Region Name", type: "text" as const },
    {
      key: "directorId",
      label: "Director",
      type: "select" as const,
      options: users.map((u) => `${u.name} (${u.role})`),
    },
  ];

  // Map users for lookup list
  const dbFields = [
    { key: "name", label: "Region Name" },
    { key: "directorId", label: "Director User ID or Name" },
  ];

  // Render original card list for Overview
  const renderOverview = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {initialRegions.map((r, i) => (
          <div
            key={i}
            className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <h3 className="text-2xl font-bold text-white mb-1 relative z-10">{r.name}</h3>
            <p className="text-indigo-400 text-sm font-medium mb-6 relative z-10">Director: {r.director}</p>
            <div className="space-y-2 text-sm text-slate-400 relative z-10 border-t border-white/5 pt-4">
              <div className="flex justify-between">
                <span>Total Sections:</span> <span className="text-white">{r.sections}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Churches:</span> <span className="text-white">{r.churches}</span>
              </div>
              <div className="flex justify-between">
                <span>Annual Growth:</span> <span className="text-emerald-400">{r.growth}</span>
              </div>
              {/* Render custom fields if they exist */}
              {r.customFields && Object.keys(JSON.parse(r.customFields || "{}")).length > 0 && (
                <div className="border-t border-white/5 pt-2 mt-2 space-y-1">
                  <span className="text-xs text-indigo-300 block font-semibold uppercase">Custom Data</span>
                  {Object.entries(JSON.parse(r.customFields)).map(([key, val]: any) => (
                    <div className="flex justify-between text-xs" key={key}>
                      <span>{key}:</span> <span className="text-slate-200">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {initialRegions.length === 0 && (
          <div className="col-span-3 text-center py-12 text-slate-500 bg-white/[0.01] border border-white/5 rounded-2xl">
            No regions found in the database. Use the "Spreadsheet Editor" or "Excel Importer" tabs to add some!
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <header className="pb-6 border-b border-white/10 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
            Regional Administration
          </h1>
          <p className="text-slate-400 mt-2">Manage Regions, Section groupings, and Regional Directors.</p>
        </div>

        {/* Tab Navigation buttons */}
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

      {/* Tab Contents */}
      {activeTab === "overview" && renderOverview()}

      {activeTab === "grid" && (
        <div className="space-y-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
            <h3 className="text-sm font-semibold text-indigo-400">Interactive Spreadsheet Editor</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add rows, update cells directly, or add custom columns. Remember to click "Save to Database" when done.
            </p>
          </div>
          <EditableGrid
            moduleName="Region"
            initialData={initialRegions}
            customFieldDefinitions={customFields}
            columns={columns}
            onSave={saveRegions}
          />
        </div>
      )}

      {activeTab === "import" && (
        <DataImporter moduleName="Region" dbFields={dbFields} onImportComplete={saveRegions} />
      )}
    </div>
  );
}
