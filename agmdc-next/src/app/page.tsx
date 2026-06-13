import React from "react";
import Link from "next/link";

export default function HomePortal() {
  const modules = [
    {
      title: "Executive Committee",
      description: "Superintendent dashboard, global metrics, and final approvals.",
      href: "/ec",
      color: "from-blue-500 to-blue-700",
    },
    {
      title: "Presbytery & Regions",
      description: "Manage regional directors, presbyters, and structural hierarchy.",
      href: "/regions",
      color: "from-indigo-500 to-indigo-700",
    },
    {
      title: "Churches & Sections",
      description: "Database of all 1,000+ churches, annual returns, and pastors.",
      href: "/churches",
      color: "from-emerald-500 to-emerald-700",
    },
    {
      title: "Complaints & Tribunal",
      description: "4-tier escalation system (Section -> Regional -> EC -> Tribunal).",
      href: "/complaints",
      color: "from-rose-500 to-rose-700",
    },
    {
      title: "Pastoral Credentials",
      description: "Process workflows for License, Certificate, and Ordination.",
      href: "/credentials",
      color: "from-amber-500 to-amber-700",
    },
    {
      title: "Transfers Portal",
      description: "Manage transfers for pastors, churches, and members.",
      href: "/transfers",
      color: "from-purple-500 to-purple-700",
    },
    {
      title: "Digital Certificates",
      description: "Issue and verify QR-coded Marriage, Baptism, and Dedication certificates.",
      href: "/certificates",
      color: "from-cyan-500 to-cyan-700",
    },
    {
      title: "Specialized Departments",
      description: "Missions, Youth, Sunday School, Women's, and Men's ministries.",
      href: "/departments",
      color: "from-teal-500 to-teal-700",
    },
  ];

  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 mb-4">
          Welcome to the AGMDC ERP
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          The unified governance platform for the Assemblies of God Malayalam District Council. Select a module below to begin managing data, workflows, and reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((mod, idx) => (
          <Link href={mod.href} key={idx} className="group relative bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:-translate-y-2 hover:bg-white/[0.06] transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mod.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {/* Placeholder for icon */}
              <div className="w-4 h-4 bg-white/50 rounded-sm"></div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">{mod.title}</h2>
            <p className="text-slate-400 text-sm flex-1">{mod.description}</p>
            <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Access Module <span className="ml-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
