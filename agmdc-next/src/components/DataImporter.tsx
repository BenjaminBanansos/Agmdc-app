"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { saveCustomFieldDefinition } from "@/app/actions/dataActions";

interface DBField {
  key: string;
  label: string;
}

interface DataImporterProps {
  moduleName: string;
  dbFields: DBField[];
  onImportComplete: (data: any[]) => Promise<{ success: boolean; error?: string }>;
}

export default function DataImporter({ moduleName, dbFields, onImportComplete }: DataImporterProps) {
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({}); // Excel Header -> DB Field Key
  const [uploading, setUploading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle local file parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFile(true);
    setMessage(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[];

        if (data.length === 0) {
          throw new Error("The selected sheet is empty.");
        }

        const excelHeaders = data[0].map((h: any) => String(h).trim());
        const rows = data.slice(1).map((row: any) => {
          const rowObj: Record<string, any> = {};
          excelHeaders.forEach((h: string, idx: number) => {
            rowObj[h] = row[idx] !== undefined ? row[idx] : "";
          });
          return rowObj;
        });

        // Smart Auto-Mapping: match Excel header names to DB fields (case insensitive)
        const initialMappings: Record<string, string> = {};
        excelHeaders.forEach((header: string) => {
          const matchedField = dbFields.find(
            (f) => f.label.toLowerCase() === header.toLowerCase() || f.key.toLowerCase() === header.toLowerCase()
          );
          if (matchedField) {
            initialMappings[header] = matchedField.key;
          } else {
            initialMappings[header] = "CUSTOM_FIELD"; // Default to importing as custom field
          }
        });

        setHeaders(excelHeaders);
        setFileData(rows);
        setMappings(initialMappings);
        setLoadingFile(false);
      } catch (err: any) {
        setLoadingFile(false);
        setMessage({ type: "error", text: err.message || "Failed to parse file." });
      }
    };

    reader.onerror = () => {
      setLoadingFile(false);
      setMessage({ type: "error", text: "File reading failed." });
    };

    reader.readAsBinaryString(file);
  };

  // Change mapping for a specific Excel column
  const handleMappingChange = (excelHeader: string, dbFieldKey: string) => {
    setMappings({
      ...mappings,
      [excelHeader]: dbFieldKey,
    });
  };

  // Execute import
  const handleImport = async () => {
    if (!fileData) return;
    setUploading(true);
    setMessage(null);

    try {
      // 1. Create custom column definitions for any columns mapped as "CUSTOM_FIELD"
      const customHeaders = Object.keys(mappings).filter((h) => mappings[h] === "CUSTOM_FIELD");
      for (const ch of customHeaders) {
        await saveCustomFieldDefinition(moduleName, ch, "TEXT");
      }

      // 2. Map all rows into DB structure
      const mappedRows = fileData.map((row) => {
        const dbRow: any = { customFields: {} };

        Object.keys(mappings).forEach((excelHeader) => {
          const mappingTarget = mappings[excelHeader];
          const cellValue = row[excelHeader];

          if (mappingTarget === "CUSTOM_FIELD") {
            dbRow.customFields[excelHeader] = cellValue;
          } else if (mappingTarget !== "SKIP") {
            dbRow[mappingTarget] = cellValue;
          }
        });

        return dbRow;
      });

      // 3. Call server action to save/upsert the mapped data
      const res = await onImportComplete(mappedRows);
      if (res.success) {
        setMessage({ type: "success", text: `Import complete! Successfully saved ${mappedRows.length} records.` });
        setFileData(null);
        setHeaders([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMessage({ type: "error", text: res.error || "Failed to save imported records." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred during import." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Bulk Data Importer (Excel/CSV)</h2>
          <p className="text-slate-400 text-xs mt-1">Upload any dataset, map its columns, and load them into the system.</p>
        </div>

        {/* File Input */}
        <label className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer shadow-lg shadow-indigo-600/10 transition">
          {loadingFile ? "Loading File..." : "Choose File"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
            disabled={loadingFile || uploading}
          />
        </label>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border flex justify-between items-center text-sm ${
            message.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="opacity-50 hover:opacity-100 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Column Mapping Configuration (Shown after selecting a file) */}
      {fileData && headers.length > 0 && (
        <div className="space-y-6 border-t border-white/5 pt-6">
          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-indigo-400 mb-2">Column Mapping Required</h3>
            <p className="text-slate-400 text-xs">
              We parsed your Excel file and auto-mapped matching fields. Review the column configuration below. Unmapped columns will be stored as dynamic Custom Fields.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="pb-3 w-1/2">Excel/CSV Column Header</th>
                  <th className="pb-3 w-1/2">Map to Database Field</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header) => (
                  <tr key={header} className="border-b border-white/5 hover:bg-white/[0.01]">
                    <td className="py-3 font-medium text-slate-200">{header}</td>
                    <td className="py-3">
                      <select
                        value={mappings[header] || "CUSTOM_FIELD"}
                        onChange={(e) => handleMappingChange(header, e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer w-64"
                      >
                        <option value="CUSTOM_FIELD">Import as Custom Field (Dynamic)</option>
                        <option value="SKIP">Skip / Do Not Import</option>
                        <hr className="border-white/10" />
                        {dbFields.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label} ({f.key})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setFileData(null);
                setHeaders([]);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-xl text-sm transition"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={uploading}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/20 transition flex items-center"
            >
              {uploading ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></span>
                  Importing data...
                </>
              ) : (
                `Import ${fileData.length} Rows`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
