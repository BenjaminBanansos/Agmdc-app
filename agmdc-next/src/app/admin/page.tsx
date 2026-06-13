import React from "react";
import { prisma } from "@/lib/prisma";

import RoleSelect from "@/components/RoleSelect";

export default async function AdminPortal() {
  const users = await prisma.user.findMany({
    include: {
      region: true,
      section: true,
      church: true,
    },
  });

  return (
    <div className="py-8">
      <header className="mb-10 pb-6 border-b border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-rose-600">
            System Administrator Portal
          </h1>
          <p className="text-slate-400 mt-2">Manage User Roles, Access Control, and Organizational Links.</p>
        </div>
        <button className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg shadow-rose-500/20">
          Invite New User
        </button>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">System Role</th>
                <th className="pb-3">Organizational Link</th>
                <th className="pb-3">2FA Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-4 font-medium text-slate-200">{u.name}</td>
                  <td className="py-4 text-slate-400">{u.email}</td>
                  <td className="py-4">
                    <RoleSelect userId={u.id} currentRole={u.role} />
                  </td>
                  <td className="py-4 text-slate-400 text-xs">
                    {u.region ? `Region: ${u.region.name}` : 
                     u.section ? `Section: ${u.section.name}` : 
                     u.church ? `Church: ${u.church.name}` : 'Unlinked'}
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs ${u.isTwoFactorEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                      {u.isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-4">
                    <button className="text-rose-400 hover:text-rose-300 mr-3 text-xs">Save</button>
                    <button className="text-slate-400 hover:text-white text-xs">Reset Password</button>
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
