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

function ScanSummary() {
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

  const stats = useMemo(() => {
    const scanned = history.filter((item) => item.status !== "Failed");
    const threats = history.filter((item) => Number(item.result?.malicious || 0) > 0 || Number(item.result?.suspicious || 0) > 0);
    const quarantined = history.filter((item) => item.status === "Quarantined");
    const clean = history.filter((item) => item.result && Number(item.result?.malicious || 0) === 0 && Number(item.result?.suspicious || 0) === 0 && item.status !== "Quarantined");
    return { total: scanned.length, threats: threats.length, quarantined: quarantined.length, clean: clean.length };
  }, [history]);

  const latest = history
    .filter((item) => item.scannedAt)
    .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))[0];

  const lastScan = latest?.scannedAt
    ? new Date(latest.scannedAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "No scans yet";

  const data = [
    ["◈", stats.total, "Total Files Scanned", "green"],
    ["⚠", stats.threats, "Threats Found", "red"],
    ["▣", stats.quarantined, "Quarantined", "orange"],
    ["✓", stats.clean, "Clean Files", "blue"],
  ];

  return (
    <div className="scan-summary card">
      <h2>Scan Summary</h2>
      <p>Last scan: {lastScan}</p>
      <div className="summary-cards">
        {data.map(([icon, number, label, type]) => (
          <div className={`summary-card ${type}`} key={label}>
            <span className="summary-icon">{icon}</span>
            <strong>{number}</strong>
            <small>{label}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScanSummary;
