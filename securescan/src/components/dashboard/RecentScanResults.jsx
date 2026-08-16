import React, { useEffect, useMemo, useState } from "react";

const HISTORY_KEY = "securescan_scan_history";

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function formatSize(bytes) {
  if (!bytes) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RecentScanResults() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const refresh = () => setHistory(readHistory());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("securescan_history_updated", refresh);
    const timer = window.setInterval(refresh, 1000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("securescan_history_updated", refresh);
      window.clearInterval(timer);
    };
  }, []);

  const files = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(b.scannedAt || 0) - new Date(a.scannedAt || 0))
      .slice(0, 6);
  }, [history]);

  return (
    <div className="recent-results card">
      <h2>Recent Scan Results</h2>

      {files.length === 0 ? (
        <div className="recent-results-empty">
          <strong>No scans yet</strong>
          <span>Completed file scans will appear here automatically.</span>
        </div>
      ) : (
        <div className="results-table">
          <div className="table-header">
            <span>File Name</span><span>File Type</span><span>Size</span><span>Result</span><span>Action</span><span>Date & Time</span>
          </div>

          {files.map((file) => {
            const malicious = Number(file.result?.malicious || 0);
            const suspicious = Number(file.result?.suspicious || 0);
            const isThreat = malicious > 0 || suspicious > 0;
            const isQuarantined = file.status === "Quarantined";
            const resultText = isQuarantined ? "Quarantined" : file.status === "Scanning" || file.status === "Queued" ? "Scanning" : isThreat ? (malicious > 0 ? "Malicious" : "Suspicious") : "Clean";
            const extension = file.fileName?.includes(".") ? `.${file.fileName.split(".").pop()}` : "—";

            return (
              <div className="table-row" key={file.id}>
                <span title={file.fileName}>{file.fileName || "Unknown file"}</span>
                <span>{extension}</span>
                <span>{formatSize(file.fileSize)}</span>
                <span><b className={isThreat || isQuarantined ? "result-malicious" : "result-clean"}>{resultText}</b></span>
                <span>
                  <button className={isThreat ? "quarantine-button" : "report-button"} type="button">
                    {isQuarantined ? "✓ Quarantined" : isThreat ? "⚠ Threat" : "◇ View Report"}
                  </button>
                </span>
                <span>{formatDate(file.scannedAt)}</span>
              </div>
            );
          })}
        </div>
      )}

      {history.length > 6 && <div className="recent-results-footer">Showing the 6 most recent scans · {history.length} total in Scan History</div>}
    </div>
  );
}

export default RecentScanResults;
