import React, { useEffect, useState } from "react";

const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? import.meta.env.VITE_API_URL || "http://localhost:5000"
    : "";

const HISTORY_KEY = "securescan_scan_history";

function saveScanHistory(scan) {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    const history = Array.isArray(existing) ? existing : [];
    const index = history.findIndex((item) => item.id === scan.id);

    if (index >= 0) history[index] = { ...history[index], ...scan };
    else history.unshift(scan);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch (storageError) {
    console.error("Unable to save scan history:", storageError);
  }
}

async function readApiResponse(response, fallbackMessage) {
  const text = await response.text();
  let data = {};

  try { data = text ? JSON.parse(text) : {}; }
  catch { data = {}; }

  if (!response.ok || !data.success) {
    throw new Error(data.message || `${fallbackMessage} (${response.status})`);
  }

  return data;
}

function ScanningPanel({ selectedFile }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Starting scan...");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!selectedFile) return;

    let cancelled = false;
    let pollTimer;
    let historyId = null;

    const scanFile = async () => {
      try {
        setProgress(5);
        setStatus("Connecting to SecureScan...");
        setError("");
        setResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/scan`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await readApiResponse(uploadResponse, "Unable to upload file");

        if (cancelled) return;
        historyId = uploadData.analysisId;

        saveScanHistory({
          id: historyId,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          scannedAt: new Date().toISOString(),
          status: "Scanning",
          progress: 15,
          result: null,
        });

        setProgress(15);
        setStatus("File uploaded. VirusTotal is analysing it...");

        const pollStatus = async () => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/scan/${encodeURIComponent(uploadData.analysisId)}`
            );

            const data = await readApiResponse(response, "Unable to get scan status");
            if (cancelled) return;

            const apiProgress = Number(data.progress) || 0;
            setProgress(Math.max(15, Math.min(100, apiProgress)));

            if (data.status === "completed") {
              const scanStats = data.result?.attributes?.stats || null;

              setProgress(100);
              setStatus("Scan complete");
              setResult(scanStats);

              saveScanHistory({
                id: historyId,
                fileName: selectedFile.name,
                fileSize: selectedFile.size,
                scannedAt: new Date().toISOString(),
                status: "Completed",
                progress: 100,
                result: scanStats,
              });
              return;
            }

            saveScanHistory({
              id: historyId,
              status: data.status === "queued" ? "Queued" : "Scanning",
              progress: Math.max(15, Math.min(100, apiProgress)),
            });

            setStatus(
              data.status === "queued"
                ? "Scan queued by VirusTotal..."
                : "VirusTotal is analysing the file..."
            );

            pollTimer = window.setTimeout(pollStatus, 2000);
          } catch (pollError) {
            if (!cancelled) {
              setError(pollError.message || "Scan status check failed.");
              setStatus("Scan failed");

              if (historyId) {
                saveScanHistory({
                  id: historyId,
                  fileName: selectedFile.name,
                  fileSize: selectedFile.size,
                  status: "Failed",
                  scannedAt: new Date().toISOString(),
                  error: pollError.message || "Scan status check failed.",
                });
              }
            }
          }
        };

        pollStatus();
      } catch (scanError) {
        if (!cancelled) {
          const message = scanError?.message || "File scanning failed.";
          setError(
            message === "Failed to fetch"
              ? "Unable to connect to the SecureScan API. Please refresh the page and try again."
              : message
          );
          setStatus("Scan failed");
          setProgress(0);
        }
      }
    };

    scanFile();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [selectedFile]);

  const fileSize = selectedFile ? selectedFile.size / 1024 / 1024 : 0;
  const malicious = Number(result?.malicious || 0);
  const suspicious = Number(result?.suspicious || 0);
  const harmless = Number(result?.harmless || 0);
  const undetected = Number(result?.undetected || 0);
  const total = malicious + suspicious + harmless + undetected;

  return (
    <div className="scanning-panel">
      <div className="scanning-title">{status}</div>

      <div className="scanning-content">
        <div className="file-info">
          <div className="file-icon">FILE</div>
          <div>
            <strong>{selectedFile?.name}</strong>
            <span>{fileSize.toFixed(1)} MB</span>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p>{selectedFile?.name}</p>
        </div>

        <strong className="progress-number">{progress}%</strong>

        {result && (
          <div className="scan-result-card">
            <div className="scan-result-top">
              <div>
                <span className="scan-result-label">SECURITY ANALYSIS</span>
                <strong className={malicious > 0 ? "danger-number" : "safe-number"}>
                  {malicious > 0 ? "Threats detected" : "No major threats detected"}
                </strong>
              </div>
              <div className="scan-result-score">
                <span>{malicious}</span>
                <small>malicious</small>
              </div>
            </div>

            <div className="scan-result-bar">
              <div className="bar-malicious" style={{ width: `${total ? (malicious / total) * 100 : 0}%` }} />
              <div className="bar-suspicious" style={{ width: `${total ? (suspicious / total) * 100 : 0}%` }} />
              <div className="bar-safe" style={{ width: `${total ? ((harmless + undetected) / total) * 100 : 100}%` }} />
            </div>

            <div className="scan-result-grid">
              <div className="result-stat malicious-stat">
                <span className="result-dot" />
                <div><strong>{malicious}</strong><small>Malicious</small></div>
              </div>
              <div className="result-stat suspicious-stat">
                <span className="result-dot" />
                <div><strong>{suspicious}</strong><small>Suspicious</small></div>
              </div>
              <div className="result-stat harmless-stat">
                <span className="result-dot" />
                <div><strong>{harmless}</strong><small>Harmless</small></div>
              </div>
              <div className="result-stat undetected-stat">
                <span className="result-dot" />
                <div><strong>{undetected}</strong><small>Undetected</small></div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="scan-error" role="alert">{error}</div>}
      </div>
    </div>
  );
}

export default ScanningPanel;
