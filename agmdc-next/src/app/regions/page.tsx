import React from "react";

export default function RegionsModule() {
  const regions = [
    { name: "South Region", director: "Rev. Samuel V.", sections: 15, churches: 340, growth: "+2.1%" },
    { name: "Central Region", director: "Rev. George A.", sections: 18, churches: 410, growth: "+3.4%" },
    { name: "North Region", director: "Rev. Varghese K.", sections: 12, churches: 250, growth: "+1.8%" },
  ];

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Regional Administration
        </h1>
        <p className="text-slate-400 mt-2">South, Central, and North Regions Overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {regions.map((r, i) => (
          <div key={i} className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
            <h3 className="text-2xl font-bold text-white mb-1 relative z-10">{r.name}</h3>
            <p className="text-indigo-400 text-sm font-medium mb-6 relative z-10">Director: {r.director}</p>
            <div className="space-y-2 text-sm text-slate-400 relative z-10">
              <div className="flex justify-between"><span>Total Sections:</span> <span className="text-white">{r.sections}</span></div>
              <div className="flex justify-between"><span>Total Churches:</span> <span className="text-white">{r.churches}</span></div>
              <div className="flex justify-between"><span>Annual Growth:</span> <span className="text-emerald-400">{r.growth}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
