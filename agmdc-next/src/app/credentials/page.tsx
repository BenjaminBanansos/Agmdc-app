import React from "react";

export default function CredentialsModule() {
  const applications = [
    { name: "Pastor John Doe", requested: "LICENSE TO PREACH", step: 1, status: "Pending Presbyter" },
    { name: "Pastor Samuel K.", requested: "CERTIFICATE", step: 3, status: "Pending EC Approval" },
    { name: "Pastor Mathew V.", requested: "ORDINATION", step: 4, status: "Approved & Issued" },
  ];

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-500">
            Pastoral Credentials
          </h1>
          <p className="text-slate-400 mt-2">3-Tier System: License → Certificate → Ordination</p>
        </div>
        <button className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-amber-500/20">
          New Application
        </button>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">4-Step Approval Workflow</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3">Applicant Name</th>
                <th className="pb-3">Credential Requested</th>
                <th className="pb-3">Approval Step</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {applications.map((app, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 font-medium text-slate-200">{app.name}</td>
                  <td className="py-4 text-amber-400 font-semibold">{app.requested}</td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4].map(step => (
                        <div key={step} className={`w-6 h-2 rounded-full ${step <= app.step ? 'bg-amber-400' : 'bg-slate-700'}`}></div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 mt-1 block">Step {app.step} of 4</span>
                  </td>
                  <td className="py-4 text-slate-400">{app.status}</td>
                  <td className="py-4">
                    <button className="text-indigo-400 hover:text-indigo-300">Review</button>
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
