import React, { useEffect, useState } from "react";

function ScanningPanel({ selectedFile }) {

  const [progress, setProgress] =
    useState(0);

  useEffect(() => {

    if (!selectedFile) return;

    setProgress(0);

    const interval = setInterval(() => {

      setProgress((previous) => {

        if (previous >= 100) {
          clearInterval(interval);
          return 100;
        }

        return previous + 4;
      });

    }, 250);

    return () => clearInterval(interval);

  }, [selectedFile]);


  const fileSize =
    selectedFile
      ? selectedFile.size / 1024 / 1024
      : 0;


  return (
    <div className="scanning-panel">

      <div className="scanning-title">
        {progress < 100
          ? "Scanning in Progress..."
          : "Scan Complete"}
      </div>


      <div className="scanning-content">

        <div className="file-info">

          <div className="file-icon">
            FILE
          </div>

          <div>

            <strong>
              {selectedFile.name}
            </strong>

            <span>
              {fileSize.toFixed(1)} MB
            </span>

          </div>

        </div>


        <div className="progress-section">

          <div className="progress-track">

            <div
              className="progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          <p>
            {selectedFile.name}
          </p>

        </div>


        <strong className="progress-number">
          {progress}%
        </strong>


        <div className="elapsed">
          Time Elapsed: 00:00:18
        </div>

      </div>

    </div>
  );
}

export default ScanningPanel;