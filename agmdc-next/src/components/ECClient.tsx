"use client";

import React, { useState, useTransition } from "react";
import { updateRecordMetadata } from "@/app/actions/dataActions";

interface ECClientProps {
  initialRegions: any[];
  initialChurches: any[];
  initialComplaints: any[];
  initialCredentials: any[];
  initialTransfers: any[];
  users: any[];
  sections: any[];
  churches: any[];
}

export default function ECClient({
  initialRegions,
  initialChurches,
  initialComplaints,
  initialCredentials,
  initialTransfers,
  users,
  sections,
  churches,
}: ECClientProps) {
  const [activeTab, setActiveTab] = useState<"regions" | "churches" | "complaints" | "credentials" | "transfers">("complaints");
  
  // State for Inspector / Sidebar
  const [selectedRecord, setSelectedRecord] = useState<{
    modelName: string;
    record: any;
  } | null>(null);

  // Inspector input states
  const [notes, setNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState("");
  const [level, setLevel] = useState("");
  const [directorId, setDirectorId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [churchId, setChurchId] = useState("");
  const [presbyterApproved, setPresbyterApproved] = useState(false);
  const [regionalApproved, setRegionalApproved] = useState(false);
  const [ecApproved, setEcApproved] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Local state copy of data to show immediate updates
  const [regions, setRegions] = useState(initialRegions);
  const [churchesList, setChurchesList] = useState(initialChurches);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [credentials, setCredentials] = useState(initialCredentials);
  const [transfers, setTransfers] = useState(initialTransfers);

  // Open the Inspector panel for a specific record
  const handleOpenInspector = (modelName: string, record: any) => {
    setSelectedRecord({ modelName, record });
    setSaveMessage(null);

    // Parse customFields
    let customVals: Record<string, any> = {};
    if (record.customFields) {
      try {
        customVals = JSON.parse(record.customFields);
      } catch (e) {}
    }

    setNotes(customVals.recommendNotes || "");
    setAssignedTo(customVals.assignedTo || "");
    setStatus(record.status || "");
    setLevel(record.level || "");
    setDirectorId(record.directorId || "");
    setSectionId(record.sectionId || "");
    setChurchId(record.churchId || "");
    setPresbyterApproved(!!record.presbyterApproved);
    setRegionalApproved(!!record.regionalApproved);
    setEcApproved(!!record.ecApproved);
  };

  // Close the Inspector panel
  const handleCloseInspector = () => {
    setSelectedRecord(null);
  };

  // Save the updates using the Server Action
  const handleSaveInspector = () => {
    if (!selectedRecord) return;
    setSaveMessage(null);

    const { modelName, record } = selectedRecord;

    startTransition(async () => {
      const updates: any = {
        notes,
        assignedTo,
        status,
        level,
        directorId,
        sectionId,
        churchId,
        presbyterApproved,
        regionalApproved,
        ecApproved,
      };

      const res = await updateRecordMetadata(modelName, record.id, updates);

      if (res.success && res.record) {
        setSaveMessage({ type: "success", text: "Metadata saved successfully!" });
        
        // Update local state copy to reflect changes instantly
        const updatedRecord = res.record;
        
        if (modelName === "Region") {
          setRegions(regions.map(r => r.id === record.id ? { ...r, ...updatedRecord } : r));
        } else if (modelName === "Church") {
          setChurchesList(churchesList.map(c => c.id === record.id ? { ...c, ...updatedRecord } : c));
        } else if (modelName === "Complaint") {
          setComplaints(complaints.map(c => c.id === record.id ? { ...c, ...updatedRecord } : c));
        } else if (modelName === "CredentialApplication") {
          setCredentials(credentials.map(c => c.id === record.id ? { ...c, ...updatedRecord } : c));
        } else if (modelName === "Transfer") {
          setTransfers(transfers.map(t => t.id === record.id ? { ...t, ...updatedRecord } : t));
        }

        // Keep local reference updated in selectedRecord
        setSelectedRecord({ modelName, record: { ...record, ...updatedRecord } });
      } else {
        setSaveMessage({ type: "error", text: res.error || "Failed to update record." });
      }
    });
  };

  // SVG Chart data preparations
  const unrecognizedChurchesCount = churchesList.filter(c => !c.isRecognized).length;
  const recognizedChurchesCount = churchesList.filter(c => c.isRecognized).length;
  
  const openComplaintsCount = complaints.filter(c => c.status === "OPEN").length;
  const closedComplaintsCount = complaints.filter(c => c.status === "CLOSED").length;

  const pastorTransfersCount = transfers.filter(t => t.type === "PASTOR").length;
  const churchTransfersCount = transfers.filter(t => t.type === "CHURCH").length;
  const memberTransfersCount = transfers.filter(t => t.type === "MEMBER").length;

  const pendingCredentialsCount = credentials.filter(c => c.status === "PENDING_PRESBYTER" || c.status === "PENDING_REGIONAL_APPROVAL" || c.status === "PENDING_EC_APPROVAL").length;
  const approvedCredentialsCount = credentials.filter(c => c.status === "APPROVED_AND_ISSUED" || c.status === "APPROVED").length;

  return (
    <div className="space-y-8 relative">
      
      {/* Visual Analytics Row (BI Deck) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Churches breakdown */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Churches Registry</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white">{churchesList.length}</div>
              <div className="text-xs text-slate-400 mt-1">
                <span className="text-emerald-400 font-semibold">{recognizedChurchesCount}</span> Recognized
              </div>
            </div>
            {/* SVG Pie Chart Placeholder */}
            <svg width="60" height="60" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="15.915" fill="none"
                stroke="#10b981" strokeWidth="4"
                strokeDasharray={`${(recognizedChurchesCount / (churchesList.length || 1)) * 100} ${100 - (recognizedChurchesCount / (churchesList.length || 1)) * 100}`}
              />
            </svg>
          </div>
        </div>

        {/* Complaints breakdown */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Tribunal & Complaints</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white">{complaints.length}</div>
              <div className="text-xs text-slate-400 mt-1">
                <span className="text-rose-400 font-semibold">{openComplaintsCount}</span> Open Cases
              </div>
            </div>
            {/* SVG Bar Chart */}
            <div className="flex items-end space-x-1 h-10 w-16">
              <div className="bg-rose-500 rounded-sm w-3" style={{ height: `${(openComplaintsCount / (complaints.length || 1)) * 100}%` }} title="Open"></div>
              <div className="bg-emerald-500 rounded-sm w-3" style={{ height: `${(closedComplaintsCount / (complaints.length || 1)) * 100}%` }} title="Closed"></div>
            </div>
          </div>
        </div>

        {/* Credentials approvals */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Pastoral Credentials</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white">{credentials.length}</div>
              <div className="text-xs text-slate-400 mt-1">
                <span className="text-amber-400 font-semibold">{pendingCredentialsCount}</span> Pending Approval
              </div>
            </div>
            {/* SVG Circle gauge */}
            <svg width="60" height="60" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="15.915" fill="none"
                stroke="#f59e0b" strokeWidth="4"
                strokeDasharray={`${(pendingCredentialsCount / (credentials.length || 1)) * 100} ${100 - (pendingCredentialsCount / (credentials.length || 1)) * 100}`}
              />
            </svg>
          </div>
        </div>

        {/* Transfers categories */}
        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">Transfers Relocation</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white">{transfers.length}</div>
              <div className="text-xs text-slate-400 mt-1 flex space-x-2">
                <span>P: {pastorTransfersCount}</span>
                <span>C: {churchTransfersCount}</span>
                <span>M: {memberTransfersCount}</span>
              </div>
            </div>
            {/* SVG Horizontal distribution bar */}
            <div className="w-16 bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
              <div className="bg-purple-500 h-full" style={{ width: `${(pastorTransfersCount / (transfers.length || 1)) * 100}%` }}></div>
              <div className="bg-blue-500 h-full" style={{ width: `${(churchTransfersCount / (transfers.length || 1)) * 100}%` }}></div>
              <div className="bg-teal-500 h-full" style={{ width: `${(memberTransfersCount / (transfers.length || 1)) * 100}%` }}></div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Workspace Section: Tabbed data grid */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-white/10 bg-slate-900/30 p-2 gap-2">
          {[
            { id: "complaints", label: "Complaints & tribunal", color: "text-rose-400 border-rose-500/30 bg-rose-500/5" },
            { id: "credentials", label: "Pastoral Credentials", color: "text-amber-400 border-amber-500/30 bg-amber-500/5" },
            { id: "transfers", label: "Transfers requests", color: "text-purple-400 border-purple-500/30 bg-purple-500/5" },
            { id: "churches", label: "Churches Registry", color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5" },
            { id: "regions", label: "Regions & sections", color: "text-blue-400 border-blue-500/30 bg-blue-500/5" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                activeTab === tab.id
                  ? `${tab.color} border-white/20 font-bold shadow-lg shadow-black/30`
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          
          {/* COMPLAINTS TAB */}
          {activeTab === "complaints" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase bg-white/[0.01]">
                  <th className="p-4">Ref Number</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Submitter</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Superintendent Notes</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {complaints.map((comp) => {
                  const custom = comp.customFields ? JSON.parse(comp.customFields) : {};
                  return (
                    <tr key={comp.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-mono text-slate-400">{comp.refNumber}</td>
                      <td className="p-4 font-medium text-slate-200">{comp.title}</td>
                      <td className="p-4 text-slate-400">{comp.submitter?.name || "Unknown"}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-semibold">{comp.level}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${comp.status === 'OPEN' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
                          {comp.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs">{custom.assignedTo || "Unassigned"}</td>
                      <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate">{custom.recommendNotes || "-"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenInspector("Complaint", comp)}
                          className="px-3 py-1 bg-rose-600/15 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* CREDENTIALS TAB */}
          {activeTab === "credentials" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase bg-white/[0.01]">
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Level Requested</th>
                  <th className="p-4">Presbyter</th>
                  <th className="p-4">Regional</th>
                  <th className="p-4">EC</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Superintendent Notes</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {credentials.map((cred) => {
                  const custom = cred.customFields ? JSON.parse(cred.customFields) : {};
                  return (
                    <tr key={cred.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-medium text-slate-200">{cred.user?.name || "Unknown"}</td>
                      <td className="p-4 text-slate-300 font-semibold">{cred.levelRequested.replace(/_/g, " ")}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${cred.presbyterApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          {cred.presbyterApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${cred.regionalApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          {cred.regionalApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${cred.ecApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                          {cred.ecApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cred.status === 'APPROVED_AND_ISSUED' || cred.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {cred.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs">{custom.assignedTo || "Unassigned"}</td>
                      <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate">{custom.recommendNotes || "-"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenInspector("CredentialApplication", cred)}
                          className="px-3 py-1 bg-amber-600/15 hover:bg-amber-600 border border-amber-500/30 text-amber-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* TRANSFERS TAB */}
          {activeTab === "transfers" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase bg-white/[0.01]">
                  <th className="p-4">Type</th>
                  <th className="p-4">Entity</th>
                  <th className="p-4">From</th>
                  <th className="p-4">To</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Assigned To</th>
                  <th className="p-4">Superintendent Notes</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {transfers.map((tr) => {
                  const custom = tr.customFields ? JSON.parse(tr.customFields) : {};
                  
                  // Resolve names for listing
                  let entName = tr.entityId;
                  let fName = tr.fromId;
                  let tName = tr.toId;

                  if (tr.type === "PASTOR" || tr.type === "MEMBER") {
                    const usr = users.find(u => u.id === tr.entityId);
                    if (usr) entName = usr.name;
                    const chFrom = churches.find(c => c.id === tr.fromId);
                    if (chFrom) fName = chFrom.name;
                    const chTo = churches.find(c => c.id === tr.toId);
                    if (chTo) tName = chTo.name;
                  } else if (tr.type === "CHURCH") {
                    const ch = churches.find(c => c.id === tr.entityId);
                    if (ch) entName = ch.name;
                    const secFrom = sections.find(s => s.id === tr.fromId);
                    if (secFrom) fName = secFrom.name;
                    const secTo = sections.find(s => s.id === tr.toId);
                    if (secTo) tName = secTo.name;
                  }

                  return (
                    <tr key={tr.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-semibold text-purple-400">{tr.type}</td>
                      <td className="p-4 font-medium text-slate-200">{entName}</td>
                      <td className="p-4 text-slate-400">{fName}</td>
                      <td className="p-4 text-slate-400">{tName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tr.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' : tr.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {tr.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs">{custom.assignedTo || "Unassigned"}</td>
                      <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate">{custom.recommendNotes || "-"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenInspector("Transfer", tr)}
                          className="px-3 py-1 bg-purple-600/15 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* CHURCHES TAB */}
          {activeTab === "churches" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase bg-white/[0.01]">
                  <th className="p-4">Church Name</th>
                  <th className="p-4">Section Name</th>
                  <th className="p-4">Recognition Status</th>
                  <th className="p-4">Pastor Assigned</th>
                  <th className="p-4">Superintendent Notes</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {churchesList.map((ch) => {
                  const custom = ch.customFields ? JSON.parse(ch.customFields) : {};
                  const sec = sections.find(s => s.id === ch.sectionId);
                  const assignedPastor = users.find(u => u.churchId === ch.id && u.role === "PASTOR");
                  
                  return (
                    <tr key={ch.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-semibold text-slate-200">{ch.name}</td>
                      <td className="p-4 text-slate-400">{sec ? sec.name : "Unlinked"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${ch.isRecognized ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {ch.isRecognized ? "Recognized" : "Unrecognized"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs">{assignedPastor ? assignedPastor.name : "None"}</td>
                      <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate">{custom.recommendNotes || "-"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenInspector("Church", ch)}
                          className="px-3 py-1 bg-emerald-600/15 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* REGIONS TAB */}
          {activeTab === "regions" && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase bg-white/[0.01]">
                  <th className="p-4">Region Name</th>
                  <th className="p-4">Director Assigned</th>
                  <th className="p-4">Total Sections</th>
                  <th className="p-4">Superintendent Notes</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {regions.map((reg) => {
                  const custom = reg.customFields ? JSON.parse(reg.customFields) : {};
                  const director = users.find(u => u.id === reg.directorId);
                  const sectionsCount = sections.filter(s => s.regionId === reg.id).length;

                  return (
                    <tr key={reg.id} className="border-b border-white/5 hover:bg-white/[0.01]">
                      <td className="p-4 font-semibold text-slate-200">{reg.name}</td>
                      <td className="p-4 text-slate-400">{director ? director.name : "Rev. TBD"}</td>
                      <td className="p-4 text-slate-400">{sectionsCount} Sections</td>
                      <td className="p-4 text-slate-400 text-xs max-w-[200px] truncate">{custom.recommendNotes || "-"}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleOpenInspector("Region", reg)}
                          className="px-3 py-1 bg-blue-600/15 hover:bg-blue-600 border border-blue-500/30 text-blue-300 hover:text-white rounded-lg text-xs font-semibold transition"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* INSPECTOR PANEL / MODAL SIDEBAR */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all animate-fadeIn">
          
          {/* Click outside to close */}
          <div className="flex-grow" onClick={handleCloseInspector}></div>

          {/* Sidebar content */}
          <div className="w-full max-w-md bg-slate-900 border-l border-white/10 h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            
            <div className="space-y-6">
              {/* Sidebar Header */}
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{selectedRecord.modelName} Manager</span>
                  <h2 className="text-xl font-bold text-slate-200 mt-1">
                    {selectedRecord.record.title || selectedRecord.record.name || `Ref: ${selectedRecord.record.refNumber || selectedRecord.record.id.substring(0,8)}`}
                  </h2>
                </div>
                <button
                  onClick={handleCloseInspector}
                  className="text-slate-400 hover:text-white font-bold text-xl h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
                >
                  ×
                </button>
              </div>

              {/* Save message notification */}
              {saveMessage && (
                <div className={`p-3 rounded-lg text-xs border ${saveMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {saveMessage.text}
                </div>
              )}

              {/* Superintendent Notes Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Recommend Notes (Custom Field)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter executive comments or recommendation notes here..."
                  className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Assignment Controls */}
              <div className="space-y-4 border-t border-white/5 pt-4">
                <h4 className="text-sm font-semibold text-slate-300">Action & Assignment Controls</h4>

                {/* COMPLAINT CONTROLS */}
                {selectedRecord.modelName === "Complaint" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Escalation Level</label>
                      <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="SECTION" className="bg-slate-900">SECTION</option>
                        <option value="REGIONAL" className="bg-slate-900">REGIONAL</option>
                        <option value="EC" className="bg-slate-900">EC</option>
                        <option value="TRIBUNAL" className="bg-slate-900">TRIBUNAL</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Case Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="OPEN" className="bg-slate-900">OPEN</option>
                        <option value="CLOSED" className="bg-slate-900">CLOSED</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Assign Case Investigator</label>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" className="bg-slate-900">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name} className="bg-slate-900">{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* CREDENTIAL APPLICATIONS CONTROLS */}
                {selectedRecord.modelName === "CredentialApplication" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Application Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PENDING_PRESBYTER" className="bg-slate-900">PENDING_PRESBYTER</option>
                        <option value="PENDING_REGIONAL_APPROVAL" className="bg-slate-900">PENDING_REGIONAL_APPROVAL</option>
                        <option value="PENDING_EC_APPROVAL" className="bg-slate-900">PENDING_EC_APPROVAL</option>
                        <option value="APPROVED_AND_ISSUED" className="bg-slate-900">APPROVED_AND_ISSUED</option>
                        <option value="REJECTED" className="bg-slate-900">REJECTED</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">3-Tier Verification Steps</label>
                      
                      <label className="flex items-center space-x-3 text-sm text-slate-200 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={presbyterApproved}
                          onChange={(e) => setPresbyterApproved(e.target.checked)}
                          className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0 w-4 h-4"
                        />
                        <span>Presbyter Approved</span>
                      </label>

                      <label className="flex items-center space-x-3 text-sm text-slate-200 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={regionalApproved}
                          onChange={(e) => setRegionalApproved(e.target.checked)}
                          className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0 w-4 h-4"
                        />
                        <span>Regional Approved</span>
                      </label>

                      <label className="flex items-center space-x-3 text-sm text-slate-200 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={ecApproved}
                          onChange={(e) => setEcApproved(e.target.checked)}
                          className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0 w-4 h-4"
                        />
                        <span>EC Approved</span>
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Assign Reviewer</label>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" className="bg-slate-900">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name} className="bg-slate-900">{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* TRANSFERS CONTROLS */}
                {selectedRecord.modelName === "Transfer" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Transfer Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PENDING_PRESBYTER" className="bg-slate-900">PENDING_PRESBYTER</option>
                        <option value="PENDING_REGIONAL_APPROVAL" className="bg-slate-900">PENDING_REGIONAL_APPROVAL</option>
                        <option value="PENDING_EC_APPROVAL" className="bg-slate-900">PENDING_EC_APPROVAL</option>
                        <option value="APPROVED" className="bg-slate-900">APPROVED</option>
                        <option value="REJECTED" className="bg-slate-900">REJECTED</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Assign Reviewer</label>
                      <select
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" className="bg-slate-900">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.name} className="bg-slate-900">{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* CHURCH CONTROLS */}
                {selectedRecord.modelName === "Church" && (
                  <>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3 text-sm text-slate-200 cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={status === "true" || selectedRecord.record.isRecognized}
                          onChange={(e) => {
                            setSelectedRecord({
                              ...selectedRecord,
                              record: { ...selectedRecord.record, isRecognized: e.target.checked }
                            });
                            setStatus(e.target.checked ? "true" : "false");
                          }}
                          className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0 w-4 h-4"
                        />
                        <span>Official Recognition Status</span>
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Relocate to Section</label>
                      <select
                        value={sectionId}
                        onChange={(e) => setSectionId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        {sections.map(s => (
                          <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* REGION CONTROLS */}
                {selectedRecord.modelName === "Region" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase">Assign Regional Director</label>
                      <select
                        value={directorId}
                        onChange={(e) => setDirectorId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                      >
                        <option value="" className="bg-slate-900">Unassigned</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id} className="bg-slate-900">{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Save Button Panel */}
            <div className="border-t border-white/10 pt-4 mt-6 flex space-x-3">
              <button
                onClick={handleCloseInspector}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
              >
                Close
              </button>
              <button
                onClick={handleSaveInspector}
                disabled={isPending}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition flex justify-center items-center"
              >
                {isPending ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
