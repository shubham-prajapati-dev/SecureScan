import React, { useEffect, useState } from "react";
import { deleteQuarantinedFile, listQuarantinedFiles } from "../utils/quarantineStore";

function formatSize(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function Quarantine() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");
      setFiles(await listQuarantinedFiles());
    } catch (loadError) {
      setError(loadError.message || "Unable to load quarantined files.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const removeFile = async (id) => {
    if (!window.confirm("Permanently delete this quarantined file from SecureScan?")) return;

    try {
      await deleteQuarantinedFile(id);
      await loadFiles();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete the quarantined file.");
    }
  };

  return (
    <div className="individual-page quarantine-page">
      <div className="quarantine-hero">
        <div>
          <span className="quarantine-eyebrow">SECURITY ISOLATION</span>
          <h2>Quarantine</h2>
          <p>Threatening files are isolated here and kept separate from your normal files.</p>
        </div>
        <div className="quarantine-shield">🛡️</div>
      </div>

      <div className="quarantine-stats">
        <div><strong>{files.length}</strong><span>Isolated Files</span></div>
        <div><strong>Protected</strong><span>Storage Status</span></div>
        <div><strong>Local</strong><span>Browser Storage</span></div>
      </div>

      {error && <div className="quarantine-page-error">{error}</div>}

      {loading ? (
        <div className="quarantine-empty"><div>⏳</div><h3>Loading quarantine...</h3></div>
      ) : files.length === 0 ? (
        <div className="quarantine-empty">
          <div>🗃️</div>
          <h3>Your quarantine is empty</h3>
          <p>When a scan detects a threat, use <strong>Quarantine File</strong> on the scan result to isolate it here.</p>
        </div>
      ) : (
        <div className="quarantine-list">
          {files.map((file) => {
            const malicious = Number(file.result?.malicious || 0);
            const suspicious = Number(file.result?.suspicious || 0);
            return (
              <div className="quarantine-card" key={file.id}>
                <div className="quarantine-file-icon">!</div>
                <div className="quarantine-file-info">
                  <strong>{file.fileName}</strong>
                  <span>{formatSize(file.fileSize)} · {new Date(file.quarantinedAt).toLocaleString()}</span>
                  <small>{malicious} malicious · {suspicious} suspicious</small>
                </div>
                <div className="quarantine-badge">ISOLATED</div>
                <button type="button" className="quarantine-delete" onClick={() => removeFile(file.id)}>
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Quarantine;
