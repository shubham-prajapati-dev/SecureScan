import React, { useEffect, useMemo, useState } from "react";
import "./Reports.css";
import {
  buildReportHtml,
  clearReports,
  deleteReport,
  downloadStoredReport,
  getReports,
  saveReport,
} from "../utils/reportStore";

const HISTORY_KEY = "securescan_scan_history";

function getHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function createReportFromScan(scan) {
  const generatedAt = new Date(scan.scannedAt || Date.now()).toLocaleString();
  const html = buildReportHtml({
    fileName: scan.fileName,
    fileSize: scan.fileSize,
    result: scan.result,
    analysisId: scan.id,
    generatedAt,
  });
  return {
    id: `report-${scan.id}`,
    analysisId: scan.id,
    fileName: scan.fileName,
    fileSize: scan.fileSize || 0,
    generatedAt,
    status: Number(scan.result?.malicious || 0) > 0
      ? "Threat Detected"
      : Number(scan.result?.suspicious || 0) > 0
        ? "Suspicious"
        : "Clean",
    malicious: Number(scan.result?.malicious || 0),
    suspicious: Number(scan.result?.suspicious || 0),
    html,
    fileNameOnDisk: `SecureScan-Report-${(scan.fileName || "scan").replace(/[^a-z0-9._-]/gi, "_")}.html`,
  };
}

function Reports() {
  const [reports, setReports] = useState([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const loadReports = () => {
    const stored = getReports();
    const storedIds = new Set(stored.map((report) => report.analysisId));
    const historyReports = getHistory()
      .filter((scan) => scan.result && (scan.status === "Completed" || scan.status === "Quarantined"))
      .filter((scan) => !storedIds.has(scan.id))
      .map(createReportFromScan);

    historyReports.forEach(saveReport);
    setReports([...historyReports, ...stored].sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)));
  };

  useEffect(() => {
    loadReports();
    const refresh = () => loadReports();
    window.addEventListener("securescan-reports-updated", refresh);
    window.addEventListener("securescan-history-updated", refresh);
    window.addEventListener("storage", refresh);
    const timer = window.setInterval(refresh, 2500);
    return () => {
      window.removeEventListener("securescan-reports-updated", refresh);
      window.removeEventListener("securescan-history-updated", refresh);
      window.removeEventListener("storage", refresh);
      window.clearInterval(timer);
    };
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesQuery = report.fileName.toLowerCase().includes(query.toLowerCase());
      const matchesFilter = filter === "All" || report.status === filter;
      return matchesQuery && matchesFilter;
    });
  }, [reports, query, filter]);

  const stats = useMemo(() => ({
    total: reports.length,
    threats: reports.filter((r) => r.status === "Threat Detected").length,
    suspicious: reports.filter((r) => r.status === "Suspicious").length,
    clean: reports.filter((r) => r.status === "Clean").length,
  }), [reports]);

  const handleDelete = (id) => {
    deleteReport(id);
    setReports(getReports());
  };

  const handleClear = () => {
    if (!reports.length) return;
    if (!window.confirm("Delete all stored reports? This cannot be undone.")) return;
    clearReports();
    setReports([]);
  };

  return (
    <div className="reports-page">
      <div className="reports-heading">
        <div>
          <span className="reports-eyebrow">SECURITY CENTER</span>
          <h2>Reports</h2>
          <p>All generated scan reports are stored here and can be downloaded again anytime.</p>
        </div>
        <button className="reports-clear-btn" type="button" onClick={handleClear} disabled={!reports.length}>Clear Reports</button>
      </div>

      <div className="reports-stats">
        <div><strong>{stats.total}</strong><span>Total Reports</span></div>
        <div className="report-stat-danger"><strong>{stats.threats}</strong><span>Threat Reports</span></div>
        <div className="report-stat-warning"><strong>{stats.suspicious}</strong><span>Suspicious</span></div>
        <div className="report-stat-safe"><strong>{stats.clean}</strong><span>Clean Reports</span></div>
      </div>

      <section className="reports-library">
        <div className="reports-toolbar">
          <div>
            <h3>Report Library</h3>
            <span>{filteredReports.length} report{filteredReports.length === 1 ? "" : "s"} available</span>
          </div>
          <div className="reports-controls">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search file name..." aria-label="Search reports" />
            <select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Filter reports">
              <option>All</option>
              <option>Threat Detected</option>
              <option>Suspicious</option>
              <option>Clean</option>
            </select>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="reports-empty">
            <div className="reports-empty-icon">📄</div>
            <h3>No reports yet</h3>
            <p>Complete a file scan and its security report will automatically appear here.</p>
          </div>
        ) : (
          <div className="reports-list">
            {filteredReports.map((report) => (
              <article className="report-row" key={report.id}>
                <div className="report-file-icon">PDF</div>
                <div className="report-main">
                  <div className="report-name-line">
                    <strong title={report.fileName}>{report.fileName}</strong>
                    <span className={`report-status ${report.status.toLowerCase().replaceAll(" ", "-")}`}>{report.status}</span>
                  </div>
                  <div className="report-meta">
                    <span>{report.fileSize / 1024 / 1024 < 1 ? `${(report.fileSize / 1024).toFixed(1)} KB` : `${(report.fileSize / 1024 / 1024).toFixed(2)} MB`}</span>
                    <span>Generated {report.generatedAt}</span>
                    <span>{report.malicious} malicious · {report.suspicious} suspicious</span>
                  </div>
                </div>
                <div className="report-actions">
                  <button className="report-download-btn" type="button" onClick={() => downloadStoredReport(report)}>↓ Download</button>
                  <button className="report-delete-btn" type="button" onClick={() => handleDelete(report.id)} aria-label={`Delete report for ${report.fileName}`}>×</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Reports;
