import React, { useEffect, useState } from "react";

// In production, always use the same Vercel origin so the scanner never
// accidentally tries to call localhost from a user's browser.
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

    if (index >= 0) {
      history[index] = { ...history[index], ...scan };
    } else {
      history.unshift(scan);
    }

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch (storageError) {
    console.error("Unable to save scan history:", storageError);
  }
}

async function readApiResponse(response, fallbackMessage) {
  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

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

        const uploadData = await readApiResponse(
          uploadResponse,
          "Unable to upload file"
        );

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

            const data = await readApiResponse(
              response,
              "Unable to get scan status"
            );

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
          <div className="scan-result">
            <strong>
              {result.malicious || 0} malicious / {result.suspicious || 0} suspicious
            </strong>
            <span>
              Harmless: {result.harmless || 0} · Undetected: {result.undetected || 0}
            </span>
          </div>
        )}

        {error && (
          <div className="scan-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default ScanningPanel;
