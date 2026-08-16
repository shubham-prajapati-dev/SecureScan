import React, { useEffect, useMemo, useState } from "react";
import "./ScanResult.css";
import "./ReportButton.css";
import { quarantineFile } from "../../utils/quarantineStore";
import { buildReportHtml, saveReport, downloadStoredReport } from "../../utils/reportStore";

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
    window.dispatchEvent(new Event("securescan-history-updated"));
  } catch (storageError) {
    console.error("Unable to save scan history:", storageError);
  }
}

function getSavedCompletedScan(file) {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    if (!Array.isArray(history)) return null;
    return history.find(
      (item) =>
        item.fileName === file.name &&
        Number(item.fileSize) === Number(file.size) &&
        Number(item.lastModified) === Number(file.lastModified) &&
        (item.status === "Completed" || item.status === "Quarantined") &&
        item.result
    ) || null;
  } catch {
    return null;
  }
}

async function readApiResponse(response, fallbackMessage) {
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = {}; }
  if (!response.ok || !data.success) {
    throw new Error(data.message || `${fallbackMessage} (${response.status})`);
  }
  return data;
}

function createAndSaveReport({ file, result, analysisId, scannedAt }) {
  const generatedAt = new Date(scannedAt || Date.now()).toLocaleString();
  const html = buildReportHtml({
    fileName: file?.name || "Unknown file",
    fileSize: file?.size || 0,
    result,
    analysisId,
    generatedAt,
  });
  return saveReport({
    id: `report-${analysisId}`,
    analysisId,
    fileName: file?.name || "Unknown file",
    fileSize: file?.size || 0,
    generatedAt,
    status: Number(result?.malicious || 0) > 0 ? "Threat Detected" : Number(result?.suspicious || 0) > 0 ? "Suspicious" : "Clean",
    malicious: Number(result?.malicious || 0),
    suspicious: Number(result?.suspicious || 0),
    html,
    fileNameOnDisk: `SecureScan-Report-${(file?.name || "scan").replace(/[^a-z0-9._-]/gi, "_")}.html`,
  });
}

function ScanningPanel({ selectedFile }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Starting scan...");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [analysisId, setAnalysisId] = useState(null);
  const [report, setReport] = useState(null);
  const [quarantineStatus, setQuarantineStatus] = useState("");

  const fileFingerprint = useMemo(
    () => selectedFile ? `${selectedFile.name}:${selectedFile.size}:${selectedFile.lastModified}` : "",
    [selectedFile]
  );

  useEffect(() => {
    if (!selectedFile || !fileFingerprint) return;
    let cancelled = false;
    let pollTimer;
    let historyId = null;

    const savedScan = getSavedCompletedScan(selectedFile);
    if (savedScan) {
      setProgress(100);
      setStatus("Scan already completed — showing saved result");
      setResult(savedScan.result);
      setAnalysisId(savedScan.id);
      setError("");
      const savedReport = createAndSaveReport({
        file: selectedFile,
        result: savedScan.result,
        analysisId: savedScan.id,
        scannedAt: savedScan.scannedAt,
      });
      setReport(savedReport);
      return () => { cancelled = true; };
    }

    const scanFile = async () => {
      try {
        setProgress(5);
        setStatus("Connecting to SecureScan...");
        setError("");
        setResult(null);
        setReport(null);
        setQuarantineStatus("");
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadResponse = await fetch(`${API_BASE_URL}/api/scan`, { method: "POST", body: formData });
        const uploadData = await readApiResponse(uploadResponse, "Unable to upload file");
        if (cancelled) return;
        historyId = uploadData.analysisId;
        setAnalysisId(historyId);
        saveScanHistory({ id: historyId, fileName: selectedFile.name, fileSize: selectedFile.size, lastModified: selectedFile.lastModified, scannedAt: new Date().toISOString(), status: "Scanning", progress: 15, result: null });
        setProgress(15);
        setStatus("File uploaded. VirusTotal is analysing it...");

        const pollStatus = async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/api/scan/${encodeURIComponent(uploadData.analysisId)}`);
            const data = await readApiResponse(response, "Unable to get scan status");
            if (cancelled) return;
            const apiProgress = Number(data.progress) || 0;
            setProgress(Math.max(15, Math.min(100, apiProgress)));
            if (data.status === "completed") {
              const scanStats = data.result?.attributes?.stats || null;
              const completedAt = new Date().toISOString();
              setProgress(100);
              setStatus("Scan complete");
              setResult(scanStats);
              saveScanHistory({ id: historyId, fileName: selectedFile.name, fileSize: selectedFile.size, lastModified: selectedFile.lastModified, scannedAt: completedAt, status: "Completed", progress: 100, result: scanStats });
              setReport(createAndSaveReport({ file: selectedFile, result: scanStats, analysisId: historyId, scannedAt: completedAt }));
              return;
            }
            saveScanHistory({ id: historyId, status: data.status === "queued" ? "Queued" : "Scanning", progress: Math.max(15, Math.min(100, apiProgress)) });
            setStatus(data.status === "queued" ? "Scan queued by VirusTotal..." : "VirusTotal is analysing the file...");
            pollTimer = window.setTimeout(pollStatus, 2000);
          } catch (pollError) {
            if (!cancelled) {
              setError(pollError.message || "Scan status check failed.");
              setStatus("Scan failed");
              if (historyId) saveScanHistory({ id: historyId, fileName: selectedFile.name, fileSize: selectedFile.size, lastModified: selectedFile.lastModified, status: "Failed", scannedAt: new Date().toISOString(), error: pollError.message || "Scan status check failed." });
            }
          }
        };
        pollStatus();
      } catch (scanError) {
        if (!cancelled) {
          const message = scanError?.message || "File scanning failed.";
          setError(message === "Failed to fetch" ? "Unable to connect to the SecureScan API. Please refresh the page and try again." : message);
          setStatus("Scan failed");
          setProgress(0);
        }
      }
    };
    scanFile();
    return () => { cancelled = true; if (pollTimer) window.clearTimeout(pollTimer); };
  }, [selectedFile, fileFingerprint]);

  const handleQuarantine = async () => {
    if (!selectedFile || !result || !analysisId) return;
    try {
      setQuarantineStatus("Quarantining...");
      const record = await quarantineFile(selectedFile, { id: `q-${analysisId}`, analysisId, result });
      saveScanHistory({ id: analysisId, fileName: selectedFile.name, fileSize: selectedFile.size, lastModified: selectedFile.lastModified, status: "Quarantined", progress: 100, result, quarantinedAt: record.quarantinedAt });
      setQuarantineStatus("File quarantined successfully");
    } catch (quarantineError) {
      setQuarantineStatus(quarantineError.message || "Unable to quarantine this file.");
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    downloadStoredReport(report);
  };

  const fileSize = selectedFile ? selectedFile.size / 1024 / 1024 : 0;
  const malicious = Number(result?.malicious || 0);
  const suspicious = Number(result?.suspicious || 0);
  const harmless = Number(result?.harmless || 0);
  const undetected = Number(result?.undetected || 0);
  const total = malicious + suspicious + harmless + undetected;
  const hasThreat = malicious > 0 || suspicious > 0;

  return (
    <div className="scanning-panel">
      <div className="scanning-title">
        <span>{status}</span>
        {result && report && (
          <div className="scan-report-actions">
            <button className="download-report-btn" type="button" onClick={handleDownloadReport}>
              ↓&nbsp; Download Report
            </button>
          </div>
        )}
      </div>

      <div className="scanning-content">
        <div className="file-info"><div className="file-icon">FILE</div><div><strong>{selectedFile?.name}</strong><span>{fileSize.toFixed(1)} MB</span></div></div>
        <div className="progress-section"><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><p>{selectedFile?.name}</p></div>
        <strong className="progress-number">{progress}%</strong>

        {result && (
          <div className="scan-result-card">
            <div className="scan-result-top">
              <div><span className="scan-result-label">SECURITY ANALYSIS</span><strong className={malicious > 0 ? "danger-number" : "safe-number"}>{malicious > 0 ? "Threats detected" : "No major threats detected"}</strong></div>
              <div className="scan-result-score"><span>{malicious}</span><small>malicious</small></div>
            </div>
            <div className="scan-result-bar"><div className="bar-malicious" style={{ width: `${total ? (malicious / total) * 100 : 0}%` }} /><div className="bar-suspicious" style={{ width: `${total ? (suspicious / total) * 100 : 0}%` }} /><div className="bar-safe" style={{ width: `${total ? ((harmless + undetected) / total) * 100 : 100}%` }} /></div>
            <div className="scan-result-grid">
              <div className="result-stat malicious-stat"><span className="result-dot" /><div><strong>{malicious}</strong><small>Malicious</small></div></div>
              <div className="result-stat suspicious-stat"><span className="result-dot" /><div><strong>{suspicious}</strong><small>Suspicious</small></div></div>
              <div className="result-stat harmless-stat"><span className="result-dot" /><div><strong>{harmless}</strong><small>Harmless</small></div></div>
              <div className="result-stat undetected-stat"><span className="result-dot" /><div><strong>{undetected}</strong><small>Undetected</small></div></div>
            </div>
            {hasThreat && (
              <div className="quarantine-action"><div><strong>Isolate this file</strong><span>Move the scanned file into SecureScan Quarantine storage.</span></div><button type="button" onClick={handleQuarantine} disabled={quarantineStatus === "Quarantining..." || quarantineStatus === "File quarantined successfully"}>{quarantineStatus === "Quarantining..." ? "Quarantining..." : quarantineStatus === "File quarantined successfully" ? "✓ Quarantined" : "Quarantine File"}</button></div>
            )}
            {quarantineStatus && quarantineStatus !== "Quarantining..." && <div className={quarantineStatus.includes("successfully") ? "quarantine-success" : "quarantine-error"}>{quarantineStatus}</div>}
          </div>
        )}
        {error && <div className="scan-error" role="alert">{error}</div>}
      </div>
    </div>
  );
}

export default ScanningPanel;
