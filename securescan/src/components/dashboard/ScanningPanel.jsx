import React, { useEffect, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function ScanningPanel({ selectedFile }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Starting scan...");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!selectedFile) return;

    let cancelled = false;
    let pollTimer;

    const scanFile = async () => {
      try {
        setProgress(5);
        setStatus("Uploading file to SecureScan...");
        setError("");
        setResult(null);

        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await fetch(`${API_BASE_URL}/api/scan`, {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json().catch(() => ({}));

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.message || "Unable to upload file.");
        }

        if (cancelled) return;

        setProgress(15);
        setStatus("File uploaded. VirusTotal is analysing it...");

        const pollStatus = async () => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/scan/${encodeURIComponent(
                uploadData.analysisId
              )}`
            );

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
              throw new Error(data.message || "Unable to get scan status.");
            }

            if (cancelled) return;

            const apiProgress = Number(data.progress) || 0;
            setProgress(Math.max(15, Math.min(100, apiProgress)));

            if (data.status === "completed") {
              setProgress(100);
              setStatus("Scan complete");
              setResult(data.result?.attributes?.stats || null);
              return;
            }

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
            }
          }
        };

        pollStatus();
      } catch (scanError) {
        if (!cancelled) {
          setError(scanError.message || "File scanning failed.");
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
      <div className="scanning-title">
        {status}
      </div>

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
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
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
