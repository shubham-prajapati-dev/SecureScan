import React from "react";

function RecentScanResults() {

  const files = [
    {
      name: "setup_new_v2.3.exe",
      type: ".exe",
      size: "24.6 MB",
      result: "Malicious",
    },
    {
      name: "invoice_2025.pdf",
      type: ".pdf",
      size: "1.2 MB",
      result: "Clean",
    },
    {
      name: "document_final.docx",
      type: ".docx",
      size: "512 KB",
      result: "Clean",
    },
    {
      name: "hack_tool_v1.0.zip",
      type: ".zip",
      size: "15.3 MB",
      result: "Malicious",
    },
  ];


  return (
    <div className="recent-results card">

      <h2>
        Recent Scan Results
      </h2>


      <div className="results-table">

        <div className="table-header">

          <span>File Name</span>
          <span>File Type</span>
          <span>Size</span>
          <span>Result</span>
          <span>Action</span>
          <span>Date & Time</span>

        </div>


        {files.map((file) => (

          <div
            className="table-row"
            key={file.name}
          >

            <span>
              {file.name}
            </span>

            <span>
              {file.type}
            </span>

            <span>
              {file.size}
            </span>

            <span>

              <b
                className={
                  file.result === "Malicious"
                    ? "result-malicious"
                    : "result-clean"
                }
              >
                {file.result}
              </b>

            </span>


            <span>

              <button
                className={
                  file.result === "Malicious"
                    ? "quarantine-button"
                    : "report-button"
                }
              >
                {file.result === "Malicious"
                  ? "♙ Quarantine"
                  : "♢ View Report"}
              </button>

            </span>


            <span>
              May 18, 2025 - 10:30 PM
            </span>

          </div>

        ))}

      </div>


      <button className="history-button">
        View Full History⌄
      </button>

    </div>
  );
}

export default RecentScanResults;