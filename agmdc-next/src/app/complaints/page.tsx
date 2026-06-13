import React from "react";

export default function ComplaintsModule() {
  const escalations = [
    { ref: "COMP-901", title: "Boundary Dispute", level: "SECTION", daysOpen: 4 },
    { ref: "COMP-902", title: "Financial Misconduct", level: "REGIONAL", daysOpen: 12 },
    { ref: "COMP-903", title: "Pastoral Ethics", level: "EXECUTIVE", daysOpen: 45 },
    { ref: "COMP-904", title: "Church Property Rights", level: "TRIBUNAL", daysOpen: 120 },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'SECTION': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'REGIONAL': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'EXECUTIVE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'TRIBUNAL': return 'bg-red-500/20 text-red-500 border-red-500/30 font-bold';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-red-500">
            Complaints & Escalation
          </h1>
          <p className="text-slate-400 mt-2">4-Tier Escalation: Section → Regional → Executive → Tribunal</p>
        </div>
        <button className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-rose-500/20">
          File New Complaint
        </button>
      </header>

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
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {escalations.map((c, i) => (
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
                    <button className="text-indigo-400 hover:text-indigo-300">View / Escalate</button>
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
