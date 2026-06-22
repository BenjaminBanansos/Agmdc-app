"use client";

import React, { useState } from "react";
import EditableGrid from "./EditableGrid";
import DataImporter from "./DataImporter";
import { saveCredentials } from "@/app/actions/dataActions";

interface CredentialsClientProps {
  initialApplications: any[];
  customFieldDefinitions: any[];
  users: any[];
}

export default function CredentialsClient({
  initialApplications,
  customFieldDefinitions,
  users,
}: CredentialsClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "grid" | "import">("overview");

  // Grid columns
  const columns = [
    {
      key: "userId",
      label: "Applicant",
      type: "select" as const,
      options: users.map((u) => `${u.name} (${u.role})`),
    },
    {
      key: "levelRequested",
      label: "Credential Requested",
      type: "select" as const,
      options: ["LICENSE_TO_PREACH", "CERTIFICATE", "ORDINATION"],
    },
    {
      key: "status",
      label: "Status",
      type: "select" as const,
      options: ["PENDING_PRESBYTER", "PENDING_REGIONAL_APPROVAL", "PENDING_EC_APPROVAL", "APPROVED_AND_ISSUED"],
    },
    { key: "presbyterApproved", label: "Presbyter Approved", type: "boolean" as const },
    { key: "regionalApproved", label: "Regional Approved", type: "boolean" as const },
    { key: "ecApproved", label: "EC Approved", type: "boolean" as const },
  ];

  // Importer DB fields mapping
  const dbFields = [
    { key: "userId", label: "Applicant User ID or Name" },
    { key: "levelRequested", label: "Credential Requested (LICENSE_TO_PREACH/CERTIFICATE/ORDINATION)" },
    { key: "status", label: "Status" },
    { key: "presbyterApproved", label: "Presbyter Approved (True/False)" },
    { key: "regionalApproved", label: "Regional Approved (True/False)" },
    { key: "ecApproved", label: "EC Approved (True/False)" },
  ];

  const renderOverview = () => {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Credential Requests</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3">Applicant Name</th>
                <th className="pb-3">Credential Requested</th>
                <th className="pb-3">Approval Step</th>
                <th className="pb-3">Status</th>
                {customFieldDefinitions.map((cf) => (
                  <th key={cf.id} className="pb-3">{cf.fieldName}</th>
                ))}
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {initialApplications.map((app, i) => {
                let customVals: Record<string, any> = {};
                if (app.customFields) {
                  try {
                    customVals = JSON.parse(app.customFields);
                  } catch (e) {}
                }

                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-4 font-medium text-slate-200">{app.name}</td>
                    <td className="py-4 text-amber-400 font-semibold">{app.requested}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`w-6 h-2 rounded-full ${step <= app.step ? "bg-amber-400" : "bg-slate-700"}`}
                          ></div>
                        ))}
                      </div>
                      <span className="text-xs text-slate-500 mt-1 block">Step {app.step} of 4</span>
                    </td>
                    <td className="py-4 text-slate-400">{app.status}</td>
                    {customFieldDefinitions.map((cf) => (
                      <td key={cf.id} className="py-4 text-slate-400">
                        {customVals[cf.fieldName] || "-"}
                      </td>
                    ))}
                    <td className="py-4">
                      <button className="text-indigo-400 hover:text-indigo-300">Review</button>
                    </td>
                  </tr>
                );
              })}
              {initialApplications.length === 0 && (
                <tr>
                  <td colSpan={5 + customFieldDefinitions.length} className="text-center py-8 text-slate-500">
                    No credential applications found. Use the "Spreadsheet Editor" or "Excel Importer" tabs to create some!
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
            Pastoral Credentials
          </h1>
          <p className="text-slate-400 mt-2">Manage license to preach, credentials, and ordination approvals.</p>
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
              Add rows, update credentials steps, and set approval states. Click "Save to Database" when done.
            </p>
          </div>
          <EditableGrid
            moduleName="CredentialApplication"
            initialData={initialApplications}
            customFieldDefinitions={customFieldDefinitions}
            columns={columns}
            onSave={saveCredentials}
          />
        </div>
      )}

      {activeTab === "import" && (
        <DataImporter moduleName="CredentialApplication" dbFields={dbFields} onImportComplete={saveCredentials} />
      )}
    </div>
  );
}
