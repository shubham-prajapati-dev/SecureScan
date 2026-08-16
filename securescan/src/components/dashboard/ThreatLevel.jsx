import React, { useEffect, useState } from "react";
import "./DashboardLive.css";

const HISTORY_KEY = "securescan_scan_history";

function readHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function ThreatLevel() {
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

  const threatFiles = history.filter((item) => {
    const malicious = Number(item.result?.malicious || 0);
    const suspicious = Number(item.result?.suspicious || 0);
    return malicious > 0 || suspicious > 0;
  });

  const maliciousFiles = history.filter((item) => Number(item.result?.malicious || 0) > 0).length;
  const suspiciousFiles = history.filter((item) => Number(item.result?.suspicious || 0) > 0 && Number(item.result?.malicious || 0) === 0).length;

  const level = maliciousFiles > 0 ? "High" : suspiciousFiles > 0 ? "Medium" : "Low";
  const riskText = level === "High" ? "Risk Detected" : level === "Medium" ? "Review Recommended" : "No Risk Detected";
  const ringClass = level === "High" ? "risk-high" : level === "Medium" ? "risk-medium" : "risk-low";
  const message = threatFiles.length > 0
    ? `Potential threats were found in ${threatFiles.length} ${threatFiles.length === 1 ? "file" : "files"}.`
    : "No threats have been detected in your scanned files.";

  return (
    <div className={`threat-level card ${ringClass}`}>
      <h2>Threat Level</h2>
      <div className="threat-content">
        <div className="risk-ring">
          <div>
            <strong>{level}</strong>
            <span>{riskText}</span>
          </div>
        </div>
        <div className="threat-message">
          <p>{message}</p>
          <p>{threatFiles.length > 0 ? "We recommend immediate action." : "Your recent scans look clean."}</p>
          <div className="threat-breakdown">
            <span>Malicious <b>{maliciousFiles}</b></span>
            <span>Suspicious <b>{suspiciousFiles}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreatLevel;
