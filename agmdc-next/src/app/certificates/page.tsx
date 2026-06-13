import React from "react";

export default function CertificatesModule() {
  const certificates = [
    { code: "BAP-2025-091", type: "Baptism", subject: "John Philip", church: "Bethel AG", date: "Oct 12, 2025", verified: true },
    { code: "MAR-2025-112", type: "Marriage", subject: "Thomas & Sarah", church: "Zion AG", date: "Nov 04, 2025", verified: true },
    { code: "MEM-2025-442", type: "Membership Transfer", subject: "Alice M.", church: "Grace AG", date: "Dec 01, 2025", verified: false },
  ];

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Digital Certificates
          </h1>
          <p className="text-slate-400 mt-2">QR-coded generation and verification for sacraments.</p>
        </div>
        <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-cyan-500/20">
          Issue Certificate
        </button>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Recent Issuances</h2>
          <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center">
            Scan QR Code
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3">Certificate Code</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Subject / Names</th>
                <th className="pb-3">Issuing Church</th>
                <th className="pb-3">Issue Date</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {certificates.map((cert, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 font-mono text-cyan-400 font-medium">{cert.code}</td>
                  <td className="py-4 font-semibold text-slate-200">{cert.type}</td>
                  <td className="py-4 text-slate-300">{cert.subject}</td>
                  <td className="py-4 text-slate-400">{cert.church}</td>
                  <td className="py-4 text-slate-400">{cert.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${cert.verified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {cert.verified ? 'Verified' : 'Unverified'}
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
