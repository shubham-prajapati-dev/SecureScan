import React from "react";
import UploadPanel from "../components/dashboard/UploadPanel";
import ScanningPanel from "../components/dashboard/ScanningPanel";

function ScanFiles({
  selectedFile,
  onFileSelect,
}) {
  return (
    <div className="individual-page">

      <h2>
        Scan Files
      </h2>

      <p>
        Upload a file to scan for malicious
        code and security threats.
      </p>

      <UploadPanel
        onFileSelect={onFileSelect}
      />

      {selectedFile && (
        <ScanningPanel
          selectedFile={selectedFile}
        />
      )}

    </div>
  );
}

export default ScanFiles;