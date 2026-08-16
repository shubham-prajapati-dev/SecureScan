import React, { useEffect, useState } from "react";

const HISTORY_KEY = "securescan_scan_history";

function ScanHistory() {
  const [history, setHistory] = useState([]);

  const loadHistory = () => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(HISTORY_KEY) || "[]"
      );
      setHistory(Array.isArray(saved) ? saved : []);
    } catch (error) {
      console.error("Unable to load scan history:", error);
      setHistory([]);
    }
  };

  useEffect(() => {
    loadHistory();

    const handleStorageChange = (event) => {
      if (event.key === HISTORY_KEY) {
        loadHistory();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const getResultText = (item) => {
    if (!item.result) return item.status || "Scanning";

    const malicious = item.result.malicious || 0;
    const suspicious = item.result.suspicious || 0;

    if (malicious > 0) return `${malicious} malicious`;
    if (suspicious > 0) return `${suspicious} suspicious`;
    return "No threats detected";
  };

  return (
    <div className="individual-page">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2>Scan History</h2>
          <p>View all your previous security scans.</p>
        </div>

        {history.length > 0 && (
          <button type="button" onClick={clearHistory}>
            Clear History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="simple-page-card">
          📋
          <h3>No scan history yet</h3>
          <p>
            Upload a file and complete a scan. Your scan will automatically
            appear here.
          </p>
        </div>
      ) : (
        <div className="simple-page-card">
          <h3>{history.length} Scan{history.length === 1 ? "" : "s"}</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "10px" }}>File</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Status</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Result</th>
                  <th style={{ textAlign: "left", padding: "10px" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "10px" }}>
                      <strong>{item.fileName}</strong>
                      <br />
                      <small>
                        {((item.fileSize || 0) / 1024 / 1024).toFixed(1)} MB
                      </small>
                    </td>
                    <td style={{ padding: "10px" }}>{item.status}</td>
                    <td style={{ padding: "10px" }}>
                      {getResultText(item)}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {item.scannedAt
                        ? new Date(item.scannedAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScanHistory;
