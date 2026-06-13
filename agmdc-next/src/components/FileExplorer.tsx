"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createFolder } from "../app/presbytery/minutes/actions";

interface MeetingMinute {
  id: string;
  title: string;
  folderName: string;
  fileUrl: string | null;
  isFolder: boolean;
  createdAt: Date;
}

export default function FileExplorer({ minutes }: { minutes: MeetingMinute[] }) {
  const [currentPath, setCurrentPath] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Parse folders and files for the current path
  const getContents = () => {
    const folders = new Set<string>();
    const files: MeetingMinute[] = [];

    minutes.forEach((minute) => {
      const fullPath = (minute.folderName || "General").replace(/^\/+|\/+$/g, '');
      
      if (currentPath === "") {
        if (fullPath.includes("/")) {
          folders.add(fullPath.split("/")[0]);
        } else {
          if (minute.isFolder) {
            folders.add(fullPath);
          } else {
            if (fullPath !== "") folders.add(fullPath);
            else files.push(minute);
          }
        }
      } else {
        if (fullPath === currentPath) {
          if (!minute.isFolder) files.push(minute);
        } else if (fullPath.startsWith(currentPath + "/")) {
          const remainder = fullPath.slice(currentPath.length + 1);
          const nextFolder = remainder.split("/")[0];
          folders.add(nextFolder);
        }
      }
    });

    return {
      folders: Array.from(folders).sort(),
      files: files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    };
  };

  const { folders, files } = getContents();
  const parts = currentPath ? currentPath.split("/") : [];

  const handleNavigate = (index: number) => {
    if (index === -1) setCurrentPath("");
    else setCurrentPath(parts.slice(0, index + 1).join("/"));
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(false);
    
    const targetPath = currentPath 
      ? `${currentPath}/${newFolderName.trim()}` 
      : newFolderName.trim();
      
    await createFolder(targetPath);
    setNewFolderName("");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8 bg-white/[0.02] border border-white/10 p-4 rounded-xl">
        <div className="flex items-center space-x-2 text-sm">
          <button 
            onClick={() => handleNavigate(-1)}
            className={`hover:text-white transition ${currentPath === "" ? "text-indigo-400 font-bold" : "text-slate-400"}`}
          >
            Root
          </button>
          {parts.map((part, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-600">/</span>
              <button 
                onClick={() => handleNavigate(idx)}
                className={`hover:text-white transition ${idx === parts.length - 1 ? "text-indigo-400 font-bold" : "text-slate-400"}`}
              >
                {part}
              </button>
            </React.Fragment>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          {isCreatingFolder ? (
            <div className="flex items-center space-x-2">
              <input 
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder Name..."
                className="bg-black/40 border border-white/10 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <button onClick={handleCreateFolder} className="text-emerald-400 hover:text-emerald-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
              <button onClick={() => setIsCreatingFolder(false)} className="text-red-400 hover:text-red-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreatingFolder(true)}
              className="flex items-center space-x-1 text-sm text-indigo-400 hover:text-indigo-300 transition bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Folder</span>
            </button>
          )}
        </div>
      </div>

      {folders.length === 0 && files.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.01] border border-white/5 rounded-2xl border-dashed">
          <p className="text-slate-500">This folder is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map(folder => (
            <div 
              key={folder} 
              onClick={() => setCurrentPath(currentPath ? `${currentPath}/${folder}` : folder)}
              className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center space-x-3 cursor-pointer hover:bg-white/[0.06] hover:border-indigo-500/50 transition group"
            >
              <div className="p-2.5 rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:scale-110 transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                </svg>
              </div>
              <span className="font-medium text-slate-200 truncate">{folder}</span>
            </div>
          ))}

          {files.map(file => (
            <div key={file.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 hover:bg-white/[0.05] transition group flex flex-col justify-between h-full">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-2 rounded-lg ${file.fileUrl ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {file.fileUrl ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    )}
                  </div>
                </div>
                <h3 className="font-medium text-slate-200 text-sm line-clamp-2" title={file.title}>{file.title}</h3>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/10">
                {file.fileUrl ? (
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-center w-full py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 rounded border border-indigo-500/20 hover:bg-indigo-500/20 transition">
                    View Document
                  </a>
                ) : (
                  <Link href={`/presbytery/minutes/${file.id}`} className="block text-center w-full py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 rounded border border-blue-500/20 hover:bg-blue-500/20 transition">
                    Read Document
                  </Link>
                )}
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
