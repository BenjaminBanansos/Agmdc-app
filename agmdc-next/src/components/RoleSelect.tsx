"use client";

import React, { useState, useTransition } from "react";
import { updateUserRole } from "@/app/admin/actions";

export default function RoleSelect({ userId, currentRole }: { userId: string, currentRole: string }) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState(currentRole);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    startTransition(() => {
      updateUserRole(userId, newRole);
    });
  };

  return (
    <select 
      value={role}
      onChange={handleChange}
      disabled={isPending}
      className={`bg-black/40 border border-white/10 rounded px-2 py-1 text-white text-xs focus:outline-none ${isPending ? 'opacity-50' : ''}`}
    >
      <option value="SYSTEM_ADMIN">System Admin</option>
      <option value="SUPERINTENDENT">Superintendent</option>
      <option value="REGIONAL_DIRECTOR">Regional Director</option>
      <option value="PRESBYTER">Presbyter</option>
      <option value="PASTOR">Pastor</option>
      <option value="MEMBER">Member</option>
    </select>
  );
}
