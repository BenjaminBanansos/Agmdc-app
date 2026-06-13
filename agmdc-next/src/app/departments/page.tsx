import React from "react";

export default function DepartmentsModule() {
  const departments = [
    { name: "Sunday School", head: "Rev. Abraham", members: 12400, activeEvents: 3 },
    { name: "Youth Ministries (CA)", head: "Pr. Justin", members: 8500, activeEvents: 1 },
    { name: "Women's Ministries (WMC)", head: "Sis. Mary", members: 15200, activeEvents: 2 },
    { name: "Missions & Evangelism", head: "Rev. Stephen", members: 1400, activeEvents: 5 },
  ];

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-400">
          Specialized Departments
        </h1>
        <p className="text-slate-400 mt-2">Manage events, directories, and reports for all ministries.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {departments.map((d, i) => (
          <div key={i} className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:-translate-y-1 transition-all">
            <h3 className="text-lg font-bold text-white mb-1">{d.name}</h3>
            <p className="text-teal-400 text-xs font-medium mb-4">Director: {d.head}</p>
            <div className="space-y-1 text-sm text-slate-400">
              <div className="flex justify-between"><span>Registered:</span> <span className="text-white">{d.members.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Active Events:</span> <span className="text-emerald-400">{d.activeEvents}</span></div>
            </div>
            <button className="mt-6 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium transition-colors">
              Manage Portal
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
