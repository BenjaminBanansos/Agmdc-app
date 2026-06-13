"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import { createMeetingMinute } from "./actions";

export default function CreateMinutePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [folderName, setFolderName] = useState("");
  const [mode, setMode] = useState<"write" | "upload">("write");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Title is required");
    
    setLoading(true);
    try {
      let fileUrl = "";

      if (mode === "upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        
        if (!res.ok) throw new Error("Upload failed");
        const data = await res.json();
        fileUrl = data.fileUrl;
      }

      await createMeetingMinute({
        title,
        folderName: folderName || "General",
        content: mode === "write" ? content : undefined,
        fileUrl: mode === "upload" ? fileUrl : undefined,
      });

      router.push("/presbytery/minutes");
    } catch (error) {
      console.error(error);
      alert("Failed to save minute.");
      setLoading(false);
    }
  };

  return (
    <div className="py-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-600">
          Create Meeting Minute
        </h1>
        <p className="text-slate-400 mt-2">Write a new document or upload an existing file.</p>
      </header>

      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Document Title</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. Q1 Financial Committee"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Folder Path (Use / for nesting)</label>
              <input 
                type="text" 
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="e.g. 2025 Meetings/Financial/Q1"
              />
            </div>
          </div>

          <div className="flex p-1 bg-black/40 rounded-lg w-full max-w-xs border border-white/10">
            <button
              type="button"
              onClick={() => setMode("write")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === "write" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              Write Document
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${mode === "upload" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              Upload File
            </button>
          </div>

          {mode === "write" ? (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Document Content</label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>
          ) : (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-10 text-center hover:border-indigo-500/50 transition bg-black/20">
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <svg className="w-12 h-12 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-lg font-medium text-slate-200">
                  {file ? file.name : "Click to browse or drag file here"}
                </span>
                <span className="text-sm text-slate-500 mt-2">Supports .PDF, .DOC, .DOCX</span>
              </label>
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading || (mode === 'upload' && !file) || (mode === 'write' && !content)}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3 rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
