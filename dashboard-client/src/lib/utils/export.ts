export type ExportFormat = "csv" | "xlsx" | "pdf";

/**
 * Format a date for export filenames or display
 */
export function formatDateForExport(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toISOString().split("T")[0];
}

/**
 * Generate a filename for exports
 */
export function generateExportFilename(prefix: string, extension: string = "csv"): string {
  return `${prefix}_${formatDateForExport()}.${extension}`;
}

/**
 * Export data to various formats
 */
export async function exportData<T extends Record<string, unknown>>(
  data: T[],
  format: ExportFormat,
  filename: string
): Promise<void> {
  const fullFilename = generateExportFilename(filename, format);

  if (format === "csv") {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")
      ),
    ].join("\n");
    downloadBlob(new Blob([csvContent], { type: "text/csv" }), fullFilename);
  } else if (format === "xlsx") {
    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Data");
    if (data.length > 0) {
      ws.columns = Object.keys(data[0]).map((key) => ({ header: key, key }));
      data.forEach((row) => ws.addRow(row));
    }
    const buffer = await wb.xlsx.writeBuffer();
    downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), fullFilename);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
