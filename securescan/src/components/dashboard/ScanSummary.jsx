import React from "react";

function ScanSummary() {

  const data = [
    ["♢", "12", "Total Files Scanned", "green"],
    ["⚠", "2", "Threats Found", "red"],
    ["▣", "1", "Quarantined", "orange"],
    ["♢", "0", "Clean Files", "blue"],
  ];

  return (
    <div className="scan-summary card">

      <h2>
        Scan Summary
      </h2>

      <p>
        Last scan: Today, 10:30 PM
      </p>


      <div className="summary-cards">

        {data.map(
          ([icon, number, label, type]) => (

            <div
              className={`summary-card ${type}`}
              key={label}
            >

              <span className="summary-icon">
                {icon}
              </span>

              <strong>
                {number}
              </strong>

              <small>
                {label}
              </small>

            </div>

          )
        )}

      </div>

    </div>
  );
}

export default ScanSummary;