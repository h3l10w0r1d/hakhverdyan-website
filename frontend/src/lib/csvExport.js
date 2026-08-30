// Turns rows of plain values into a CSV string and triggers a browser
// download. `columns` is [{ key, label }]; `rows` are plain objects.
function escapeCell(value) {
  const str = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function downloadCsv(filename, columns, rows) {
  const header = columns.map(c => escapeCell(c.label)).join(",");
  const lines = rows.map(row => columns.map(c => escapeCell(c.value(row))).join(","));
  const csv = [header, ...lines].join("\r\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
