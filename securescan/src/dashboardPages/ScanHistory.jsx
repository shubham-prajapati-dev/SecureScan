import React, { useEffect, useState } from "react";

const HISTORY_KEY = "securescan_scan_history";

function ScanHistory() {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");

  const loadHistory = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setHistory(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error("Unable to load scan history:", error);
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();

    const handleStorageChange = (event) => {
      if (event.key === HISTORY_KEY) loadHistory();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const clearHistory = () => {
    if (window.confirm("Clear all scan history? This cannot be undone.")) {
      localStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    }
  };

  const getThreatLevel = (item) => {
    if (item.status === "Failed") return "failed";
    if (!item.result) return "scanning";
    if ((item.result.malicious || 0) > 0) return "danger";
    if ((item.result.suspicious || 0) > 0) return "warning";
    return "safe";
  };

  const getResultText = (item) => {
    if (!item.result) return item.status || "Scanning";

    const malicious = item.result.malicious || 0;
    const suspicious = item.result.suspicious || 0;
    const harmless = item.result.harmless || 0;

    if (malicious > 0) return `${malicious} malicious`;
    if (suspicious > 0) return `${suspicious} suspicious`;
    return `${harmless} engines found no threat`;
  };

  const getStatusLabel = (item) => {
    const level = getThreatLevel(item);
    if (level === "safe") return "Safe";
    if (level === "danger") return "Threat Detected";
    if (level === "warning") return "Suspicious";
    if (level === "failed") return "Failed";
    return "Scanning";
  };

  const filteredHistory = history.filter((item) => {
    if (filter === "All") return true;
    return getStatusLabel(item) === filter;
  });

  const safeCount = history.filter((item) => getThreatLevel(item) === "safe").length;
  const threatCount = history.filter((item) => getThreatLevel(item) === "danger").length;
  const suspiciousCount = history.filter((item) => getThreatLevel(item) === "warning").length;

  const statusStyles = {
    safe: { background: "#ecfdf3", color: "#087443", border: "#bbf7d0", icon: "✓" },
    danger: { background: "#fff1f2", color: "#c1121f", border: "#fecdd3", icon: "!" },
    warning: { background: "#fff8e7", color: "#a16207", border: "#fde68a", icon: "⚠" },
    scanning: { background: "#eff6ff", color: "#2563eb", border: "#bfdbfe", icon: "↻" },
    failed: { background: "#f3f4f6", color: "#4b5563", border: "#d1d5db", icon: "×" },
  };

  return (
    <div className="individual-page" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "7px" }}>
            <div style={{ width: "46px", height: "46px", borderRadius: "14px", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #2563eb, #7c3aed)", color: "white", fontSize: "22px", boxShadow: "0 8px 20px rgba(37, 99, 235, .22)" }}>⌁</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "28px" }}>Scan History</h2>
              <p style={{ margin: "4px 0 0", color: "#64748b" }}>Review every file you've scanned with SecureScan.</p>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            style={{ border: "1px solid #fecaca", background: "#fff", color: "#dc2626", borderRadius: "10px", padding: "10px 15px", fontWeight: 600, cursor: "pointer" }}
          >
            Clear History
          </button>
        )}
      </div>

      {history.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "22px" }}>
          {[
            ["Total Scans", history.length, "◉", "#eff6ff", "#2563eb"],
            ["Safe Files", safeCount, "✓", "#ecfdf3", "#087443"],
            ["Threats", threatCount, "!", "#fff1f2", "#c1121f"],
            ["Suspicious", suspiciousCount, "⚠", "#fff8e7", "#a16207"],
          ].map(([label, value, icon, background, color]) => (
            <div key={label} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "18px", display: "flex", alignItems: "center", gap: "14px", boxShadow: "0 5px 18px rgba(15,23,42,.05)" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background, color, display: "grid", placeItems: "center", fontWeight: 800 }}>{icon}</div>
              <div><div style={{ fontSize: "24px", fontWeight: 800, color: "#111827" }}>{value}</div><div style={{ fontSize: "13px", color: "#64748b" }}>{label}</div></div>
            </div>
          ))}
        </div>
      )}

      {history.length === 0 ? (
        <div style={{ background: "linear-gradient(145deg, #f8fbff, #ffffff)", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "64px 24px", textAlign: "center", boxShadow: "0 12px 35px rgba(15,23,42,.06)" }}>
          <div style={{ width: "70px", height: "70px", margin: "0 auto 18px", borderRadius: "20px", display: "grid", placeItems: "center", background: "#eff6ff", color: "#2563eb", fontSize: "30px" }}>⌁</div>
          <h3 style={{ margin: "0 0 8px", fontSize: "21px" }}>No scans yet</h3>
          <p style={{ margin: 0, color: "#64748b", maxWidth: "480px", marginInline: "auto" }}>Upload a file from the Scan Files section. Completed scans will automatically appear here.</p>
        </div>
      ) : (
        <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "20px", overflow: "hidden", boxShadow: "0 12px 35px rgba(15,23,42,.06)" }}>
          <div style={{ padding: "18px 20px", borderBottom: "1px solid #eef2f7", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div><h3 style={{ margin: 0, fontSize: "18px" }}>Recent scans</h3><span style={{ color: "#94a3b8", fontSize: "13px" }}>{filteredHistory.length} result{filteredHistory.length === 1 ? "" : "s"}</span></div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {["All", "Safe", "Threat Detected", "Suspicious", "Scanning", "Failed"].map((option) => (
                <button key={option} type="button" onClick={() => setFilter(option)} style={{ border: "1px solid #e2e8f0", background: filter === option ? "#2563eb" : "#fff", color: filter === option ? "#fff" : "#64748b", borderRadius: "9px", padding: "7px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>{option}</button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {['FILE', 'STATUS', 'SCAN RESULT', 'DATE'].map((heading) => <th key={heading} style={{ textAlign: "left", padding: "13px 20px", color: "#64748b", fontSize: "11px", letterSpacing: ".06em", fontWeight: 700 }}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => {
                  const level = getThreatLevel(item);
                  const style = statusStyles[level];
                  return (
                    <tr key={item.id} style={{ borderTop: "1px solid #eef2f7" }}>
                      <td style={{ padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f1f5f9", display: "grid", placeItems: "center", color: "#475569", fontSize: "17px" }}>▤</div>
                          <div><strong style={{ display: "block", color: "#1e293b", maxWidth: "290px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.fileName || "Unknown file"}</strong><small style={{ color: "#94a3b8" }}>{((item.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</small></div>
                        </div>
                      </td>
                      <td style={{ padding: "16px 20px" }}><span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: style.background, color: style.color, border: `1px solid ${style.border}`, borderRadius: "999px", padding: "6px 10px", fontSize: "12px", fontWeight: 700 }}><span>{style.icon}</span>{getStatusLabel(item)}</span></td>
                      <td style={{ padding: "16px 20px", color: "#475569", fontSize: "13px" }}><strong>{getResultText(item)}</strong>{item.result && <div style={{ marginTop: "4px", color: "#94a3b8", fontSize: "12px" }}>Harmless: {item.result.harmless || 0} · Undetected: {item.result.undetected || 0}</div>}</td>
                      <td style={{ padding: "16px 20px", color: "#64748b", fontSize: "13px", whiteSpace: "nowrap" }}>{item.scannedAt ? new Date(item.scannedAt).toLocaleString() : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredHistory.length === 0 && <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>No scans match this filter.</div>}
        </div>
      )}
    </div>
  );
}

export default ScanHistory;
