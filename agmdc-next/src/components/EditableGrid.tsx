"use client";

import React, { useState } from "react";
import { saveCustomFieldDefinition } from "@/app/actions/dataActions";

interface ColumnDefinition {
  key: string;
  label: string;
  type: "text" | "select" | "boolean";
  options?: string[];
}

interface EditableGridProps {
  moduleName: string;
  initialData: any[];
  customFieldDefinitions: any[];
  columns: ColumnDefinition[];
  onSave: (data: any[]) => Promise<{ success: boolean; error?: string }>;
}

export default function EditableGrid({
  moduleName,
  initialData,
  customFieldDefinitions,
  columns,
  onSave,
}: EditableGridProps) {
  const [rows, setRows] = useState<any[]>(() =>
    initialData.map((item) => {
      // Parse customFields string from DB if it exists
      let customFields = {};
      if (item.customFields) {
        try {
          customFields = JSON.parse(item.customFields);
        } catch (e) {
          console.error("Error parsing customFields JSON:", e);
        }
      }
      return { ...item, customFields };
    })
  );

  const [customFields, setCustomFields] = useState<any[]>(customFieldDefinitions);
  const [newColName, setNewColName] = useState("");
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Combine standard and custom columns for header display
  const allColumns = [
    ...columns,
    ...customFields.map((cf) => ({
      key: `custom_${cf.fieldName}`,
      label: cf.fieldName,
      type: cf.fieldType.toLowerCase() as any,
    })),
  ];

  // Add a new row
  const handleAddRow = () => {
    const newRow: any = { customFields: {} };
    columns.forEach((col) => {
      if (col.type === "boolean") {
        newRow[col.key] = false;
      } else {
        newRow[col.key] = "";
      }
    });
    setRows([...rows, newRow]);
  };

  // Delete a row locally
  const handleDeleteRow = (index: number) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  // Add a new custom column
  const handleAddColumn = async () => {
    if (!newColName.trim()) return;
    try {
      const sanitizedName = newColName.trim();
      // Save definition in database
      const newDef = await saveCustomFieldDefinition(moduleName, sanitizedName, "TEXT");
      setCustomFields([...customFields, newDef]);
      setNewColName("");
      setIsAddingCol(false);
      setMessage({ type: "success", text: `Column "${sanitizedName}" added successfully!` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to add column." });
    }
  };

  // Update a specific cell value
  const handleCellChange = (rowIndex: number, columnKey: string, value: any) => {
    const updated = [...rows];
    if (columnKey.startsWith("custom_")) {
      const actualKey = columnKey.replace("custom_", "");
      updated[rowIndex].customFields = {
        ...updated[rowIndex].customFields,
        [actualKey]: value,
      };
    } else {
      updated[rowIndex][columnKey] = value;
    }
    setRows(updated);
  };

  // Save grid data
  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const result = await onSave(rows);
      if (result.success) {
        setMessage({ type: "success", text: "All changes saved successfully!" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to save records." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
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

      {/* Grid Controls */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex space-x-2">
          <button
            onClick={handleAddRow}
            className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center"
          >
            <span className="mr-1.5 font-bold">+</span> Add Row
          </button>
          
          {/* Add Column Trigger */}
          {isAddingCol ? (
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
              <input
                type="text"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="Column Name"
                className="bg-transparent text-sm focus:outline-none text-white w-32"
                autoFocus
              />
              <button onClick={handleAddColumn} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold">
                Create
              </button>
              <button onClick={() => setIsAddingCol(false)} className="text-slate-400 hover:text-slate-300 text-xs">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCol(true)}
              className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center"
            >
              <span className="mr-1.5 font-bold">+</span> Add Column
            </button>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 transition flex items-center"
        >
          {saving ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></span>
              Saving...
            </>
          ) : (
            "Save to Database"
          )}
        </button>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-xs uppercase tracking-wider">
                {allColumns.map((col) => (
                  <th key={col.key} className="p-4 border-r border-white/5 font-semibold">
                    {col.label}
                  </th>
                ))}
                <th className="p-4 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                  {allColumns.map((col) => {
                    const isCustom = col.key.startsWith("custom_");
                    const actualKey = isCustom ? col.key.replace("custom_", "") : col.key;
                    const val = isCustom ? row.customFields?.[actualKey] || "" : row[actualKey] ?? "";

                    return (
                      <td key={col.key} className="p-2 border-r border-white/5">
                        {col.type === "boolean" ? (
                          <div className="flex justify-center items-center h-full">
                            <input
                              type="checkbox"
                              checked={!!val}
                              onChange={(e) => handleCellChange(rowIndex, col.key, e.target.checked)}
                              className="rounded border-white/10 bg-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                            />
                          </div>
                        ) : col.type === "select" && col.options ? (
                          <select
                            value={val}
                            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                            className="bg-transparent border-0 focus:ring-0 text-slate-200 text-sm w-full p-2 cursor-pointer focus:bg-slate-800 rounded"
                          >
                            <option value="" className="bg-slate-900">Select...</option>
                            {col.options.map((opt) => (
                              <option key={opt} value={opt} className="bg-slate-900">
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={val}
                            onChange={(e) => handleCellChange(rowIndex, col.key, e.target.value)}
                            className="bg-transparent border-0 focus:ring-0 text-slate-200 text-sm w-full p-2 focus:bg-slate-800/50 rounded focus:outline-none"
                            placeholder="Enter value..."
                          />
                        )}
                      </td>
                    );
                  })}
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="text-rose-500 hover:text-rose-400 text-sm font-semibold p-2 rounded hover:bg-rose-500/10 transition-colors"
                      title="Delete Row"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={allColumns.length + 1} className="p-8 text-center text-slate-500 text-sm">
                    No records in the list. Click "+ Add Row" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
