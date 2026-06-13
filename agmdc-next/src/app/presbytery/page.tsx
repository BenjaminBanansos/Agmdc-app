import React from "react";

export default function PresbyteryModule() {
  const presbyters = [
    { name: "Rev. Thomas K.", section: "Trivandrum South", churches: 18, status: "Active" },
    { name: "Rev. Mathew P.", section: "Kochi Central", churches: 24, status: "Active" },
    { name: "Rev. John M.", section: "Kozhikode North", churches: 15, status: "On Leave" },
  ];

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
          Presbytery Management
        </h1>
        <p className="text-slate-400 mt-2">Manage Section Presbyters and Official Minutes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <a href="/presbytery/credentials" className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition group mb-6 block">
            <div className="w-12 h-12 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Presbyter Credential Approvals</h2>
            <p className="text-slate-400 text-sm">Review incoming Pastor credential applications.</p>
          </a>

          <a href="/presbytery/minutes" className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition group mb-6 block">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Section Committee Minutes</h2>
            <p className="text-slate-400 text-sm">Write documents or upload existing PDFs & DOCXs.</p>
          </a>

          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-6">Active Presbyters (~45 Sections)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-sm">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Assigned Section</th>
                    <th className="pb-3">Churches Managed</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {presbyters.map((p, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-4 font-medium text-slate-200">{p.name}</td>
                      <td className="py-4 text-slate-400">{p.section}</td>
                      <td className="py-4 text-slate-400">{p.churches}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded text-xs ${p.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
            <h3 className="font-semibold mb-4 text-lg">Presbytery Actions</h3>
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all mb-3 text-sm">Record Meeting Minutes</button>
            <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all mb-3 text-sm">Assign Presbyter to Section</button>
          </div>
        </div>
      </div>
    </div>
  );
}
