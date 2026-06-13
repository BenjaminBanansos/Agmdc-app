import React from "react";

export default function ChurchesModule() {
  const churches = [
    { id: "CH-001", name: "Bethel AG", section: "Trivandrum South", pastor: "Rev. Thomas", members: 450, recognized: true },
    { id: "CH-002", name: "Zion AG", section: "Kochi Central", pastor: "Pr. Jacob", members: 120, recognized: false },
    { id: "CH-003", name: "Grace AG", section: "Kozhikode North", pastor: "Rev. Samuel", members: 850, recognized: true },
  ];

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400">
            Churches Directory
          </h1>
          <p className="text-slate-400 mt-2">Manage ~1000 Local Churches and Annual Returns.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-emerald-500/20">
          Submit Annual Return
        </button>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Church Registry</h2>
          <input type="text" placeholder="Search churches..." className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500" />
        </div>
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
              </tr>
            </thead>
            <tbody className="text-sm">
              {churches.map((c, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 font-mono text-slate-500">{c.id}</td>
                  <td className="py-4 font-medium text-slate-200">{c.name}</td>
                  <td className="py-4 text-slate-400">{c.section}</td>
                  <td className="py-4 text-slate-400">{c.pastor}</td>
                  <td className="py-4 text-slate-400">{c.members}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${c.recognized ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {c.recognized ? 'Recognized' : 'Unrecognized'}
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
