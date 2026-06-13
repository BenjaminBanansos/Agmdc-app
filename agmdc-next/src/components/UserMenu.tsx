"use client";

import React from "react";
import { signOut } from "next-auth/react";

export default function UserMenu({ session }: { session: any }) {
  if (!session) {
    return (
      <a href="/login" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-md text-sm font-medium transition text-white">
        Login
      </a>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-right hidden md:block">
        <div className="text-sm font-medium text-slate-200">{session.user?.name}</div>
        <div className="text-xs text-indigo-400 font-semibold">{session.user?.role}</div>
      </div>
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
        {session.user?.name?.charAt(0) || "U"}
      </div>
      <button 
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-3 py-2 text-sm text-slate-400 hover:text-white transition"
      >
        Sign Out
      </button>
    </div>
  );
}
