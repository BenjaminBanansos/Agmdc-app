import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserMenu from "@/components/UserMenu";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AGMDC Unified ERP Platform",
  description: "Governance, Complaints, Credentials, and Reporting",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col`}>
        {/* TOP NAVIGATION BAR */}
        <nav className="bg-white/5 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo / Brand */}
              <div className="flex items-center">
                <a href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center font-bold">
                    AG
                  </div>
                  <span className="font-bold text-lg hidden sm:block">AGMDC ERP</span>
                </a>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex space-x-1">
                <a href="/" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Home</a>
                
                <a href="/ec" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Executive</a>
                
                <a href="/presbytery" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Presbytery</a>
                <a href="/regions" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Regions</a>
                <a href="/complaints" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Complaints</a>
                <a href="/credentials" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Credentials</a>
                <a href="/transfers" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Transfers</a>
                <a href="/departments" className="px-3 py-2 text-sm font-medium hover:text-white text-slate-300 hover:bg-white/5 rounded-md transition">Departments</a>
                
                <a href="/admin" className="px-3 py-2 text-sm font-medium hover:text-white text-rose-400 hover:bg-rose-500/10 rounded-md transition border border-rose-500/20 ml-2">Admin Portal</a>
              </div>

              {/* User Profile / Actions */}
              <UserMenu session={session} />
            </div>
          </div>
        </nav>

        {/* PAGE CONTENT */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
